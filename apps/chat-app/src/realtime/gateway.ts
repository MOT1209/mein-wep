import type { IncomingMessage, Server as HttpServer } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { many, one } from '../config/db.js';
import { logger } from '../lib/logger.js';
import { verifyAccessToken } from '../lib/tokens.js';
import * as conversations from '../modules/conversations/conversations.service.js';
import { clientEventSchema, WS_CLOSE, type ServerEvent } from './events.js';
import * as hub from './hub.js';
import * as presence from './presence.js';

const HEARTBEAT_MS = 30_000;
const AUTH_TIMEOUT_MS = 5_000;

interface SocketState {
  userId?: string;
  clientId?: string;
  alive: boolean;
}

async function relatedUserIds(userId: string): Promise<string[]> {
  const rows = await many<{ user_id: string }>(
    `select distinct other.user_id
       from conversation_participants mine
       join conversation_participants other
         on other.conversation_id = mine.conversation_id and other.user_id <> mine.user_id
      where mine.user_id = $1`,
    [userId],
  );
  return rows.map((r) => r.user_id);
}

function send(socket: WebSocket, event: ServerEvent): void {
  if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(event));
}

async function announcePresence(userId: string, status: 'online' | 'offline', lastSeenAt: string) {
  const related = await relatedUserIds(userId);
  hub.sendToUsers(related, { type: 'presence:update', userId, status, lastSeenAt });
}

async function handleClientEvent(
  userId: string,
  raw: unknown,
): Promise<ServerEvent | null> {
  const parsed = clientEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { type: 'error', code: 'VALIDATION_ERROR', message: 'Unknown or invalid event.' };
  }
  const event = parsed.data;

  switch (event.type) {
    case 'ping':
      return { type: 'pong', serverTime: new Date().toISOString() };

    case 'typing': {
      const { otherUserId } = await conversations.assertMember(event.conversationId, userId);
      hub.sendToUser(otherUserId, {
        type: 'typing',
        conversationId: event.conversationId,
        userId,
        isTyping: event.isTyping,
      });
      return null;
    }

    case 'message:read': {
      const { lastReadAt, participantIds } = await conversations.markRead(
        userId,
        event.conversationId,
        event.lastReadMessageId,
      );
      hub.sendToUsers(participantIds, {
        type: 'message:read',
        conversationId: event.conversationId,
        userId,
        lastReadAt,
        lastReadMessageId: event.lastReadMessageId ?? null,
      });
      return null;
    }

    case 'message:delivered': {
      await conversations.assertMember(event.conversationId, userId);
      await conversations.markDelivered(userId, event.conversationId);
      return null;
    }

    default:
      return { type: 'error', code: 'VALIDATION_ERROR', message: 'Unsupported event.' };
  }
}

export function attachRealtimeServer(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 16 * 1024 });
  const states = new WeakMap<WebSocket, SocketState>();

  wss.on('connection', (socket: WebSocket, _req: IncomingMessage) => {
    const state: SocketState = { alive: true };
    states.set(socket, state);
    let closed = false;

    const authTimer = setTimeout(() => {
      if (!state.userId) socket.close(WS_CLOSE.UNAUTHORIZED, 'Authentication timeout.');
    }, AUTH_TIMEOUT_MS);

    socket.on('pong', () => {
      state.alive = true;
    });

    socket.on('message', async (data) => {
      let payload: unknown;
      try {
        payload = JSON.parse(data.toString());
      } catch {
        send(socket, { type: 'error', code: 'VALIDATION_ERROR', message: 'Invalid JSON.' });
        return;
      }

      // ── Pre-auth: the very first frame must authenticate the socket. ──
      if (!state.userId) {
        const token =
          typeof payload === 'object' && payload !== null && 'token' in payload
            ? (payload as { token?: unknown }).token
            : undefined;
        const isAuthFrame =
          typeof payload === 'object' &&
          payload !== null &&
          (payload as { type?: unknown }).type === 'auth';
        if (!isAuthFrame || typeof token !== 'string') {
          socket.close(WS_CLOSE.UNAUTHORIZED, 'Send {type:"auth",token} first.');
          return;
        }
        try {
          const claims = verifyAccessToken(token);
          state.userId = claims.sub;
        } catch {
          socket.close(WS_CLOSE.UNAUTHORIZED, 'Invalid access token.');
          return;
        }
        clearTimeout(authTimer);

        const client = hub.registerClient(state.userId, socket);
        state.clientId = client.id;
        presence.addConnection(state.userId, client.id);
        send(socket, {
          type: 'hello',
          userId: state.userId,
          serverTime: new Date().toISOString(),
        });
        await announcePresence(state.userId, 'online', new Date().toISOString());
        return;
      }

      try {
        const reply = await handleClientEvent(state.userId, payload);
        if (reply) send(socket, reply);
      } catch (err) {
        const code =
          typeof err === 'object' && err !== null && 'code' in err
            ? String((err as { code: unknown }).code)
            : 'INTERNAL_ERROR';
        const message =
          typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Something went wrong.';
        // Members get a 404 rather than a 403 — never confirm existence.
        send(socket, { type: 'error', code, message });
      }
    });

    socket.on('close', async () => {
      if (closed) return;
      closed = true;
      clearTimeout(authTimer);
      const { userId, clientId } = state;
      if (!userId || !clientId) return;

      const client = hub.clientsOf(userId).find((c) => c.id === clientId);
      if (client) hub.unregisterClient(client);
      const wentOffline = presence.removeConnection(userId, clientId);

      if (wentOffline) {
        const lastSeenAt = new Date().toISOString();
        await one('update users set last_seen_at = now() where id = $1', [userId]).catch(
          () => null,
        );
        await announcePresence(userId, 'offline', lastSeenAt);
      }
    });

    socket.on('error', (err) => {
      logger.warn('websocket error', { message: err.message });
    });
  });

  const heartbeat = setInterval(() => {
    for (const socket of wss.clients) {
      const state = states.get(socket);
      if (!state) continue;
      if (!state.alive) {
        socket.terminate();
        continue;
      }
      state.alive = false;
      socket.ping();
    }
  }, HEARTBEAT_MS);

  wss.on('close', () => clearInterval(heartbeat));

  logger.info('realtime gateway attached', { path: '/ws', heartbeatMs: HEARTBEAT_MS });
  return wss;
}
