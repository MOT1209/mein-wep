import http from 'node:http';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { WebSocket } from 'ws';
import { createApp } from '../src/app.js';
import { query } from '../src/config/db.js';
import { attachRealtimeServer } from '../src/realtime/gateway.js';
import { resetHub } from '../src/realtime/hub.js';
import { resetPresence } from '../src/realtime/presence.js';

export async function resetDb(): Promise<void> {
  await query(
    `truncate table refresh_tokens, messages, conversation_participants, conversations, users
     restart identity cascade`,
  );
  resetHub();
  resetPresence();
}

export interface TestServer {
  httpUrl: string;
  wsUrl: string;
  close: () => Promise<void>;
}

export async function startTestServer(): Promise<TestServer> {
  const app = createApp();
  const server = http.createServer(app);
  attachRealtimeServer(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    httpUrl: `http://127.0.0.1:${port}`,
    wsUrl: `ws://127.0.0.1:${port}/ws`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

export interface RegisteredUser {
  id: string;
  username: string;
  email: string;
  password: string;
  displayName: string;
  accessToken: string;
  refreshToken?: string;
}

let counter = 0;
function uniqueSuffix(): string {
  counter += 1;
  return `${Date.now().toString(36)}${counter}`;
}

export function uniqueUsername(): string {
  return `u${uniqueSuffix()}`.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 32);
}

export async function registerUser(
  httpUrl: string,
  overrides: Partial<{
    username: string;
    email: string;
    password: string;
    displayName: string;
  }> = {},
): Promise<RegisteredUser> {
  const username = overrides.username ?? uniqueUsername();
  const password = overrides.password ?? 'Password123!';
  const body = {
    username,
    email: overrides.email ?? `${username}@example.com`,
    password,
    displayName: overrides.displayName ?? 'Test User',
  };

  const res = await request(httpUrl).post('/api/v1/auth/register').send(body);
  if (res.status !== 201) {
    throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  const setCookie = res.headers['set-cookie'];
  const refresh = Array.isArray(setCookie)
    ? setCookie.find((c) => c.startsWith('refresh_token='))
    : undefined;

  return {
    id: res.body.user.id as string,
    username: body.username,
    email: body.email,
    password,
    displayName: body.displayName,
    accessToken: res.body.accessToken as string,
    refreshToken: refresh?.split(';')[0]?.split('=')[1],
  };
}

export function authed(httpUrl: string, token: string) {
  const agent = request(httpUrl);
  return {
    get: (path: string) => agent.get(path).set('Authorization', `Bearer ${token}`),
    post: (path: string) => agent.post(path).set('Authorization', `Bearer ${token}`),
    patch: (path: string) => agent.patch(path).set('Authorization', `Bearer ${token}`),
    delete: (path: string) => agent.delete(path).set('Authorization', `Bearer ${token}`),
  };
}

export interface WsTestClient {
  socket: WebSocket;
  events: Array<Record<string, unknown>>;
  waitFor: (type: string, timeoutMs?: number) => Promise<Record<string, unknown>>;
  send: (payload: unknown) => void;
  close: () => void;
}

export async function connectWs(wsUrl: string, token: string): Promise<WsTestClient> {
  const socket = new WebSocket(wsUrl);
  const events: Array<Record<string, unknown>> = [];
  const waiters: Array<{ type: string; resolve: (e: Record<string, unknown>) => void; timer: NodeJS.Timeout }> = [];

  socket.on('message', (raw) => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw.toString());
    } catch {
      return;
    }
    events.push(parsed);
    for (let i = waiters.length - 1; i >= 0; i -= 1) {
      const waiter = waiters[i];
      if (waiter && waiter.type === parsed.type) {
        clearTimeout(waiter.timer);
        waiters.splice(i, 1);
        waiter.resolve(parsed);
      }
    }
  });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('ws open timeout')), 5000);
    socket.once('open', () => {
      clearTimeout(timer);
      resolve();
    });
    socket.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });

  socket.send(JSON.stringify({ type: 'auth', token }));

  const client: WsTestClient = {
    socket,
    events,
    send: (payload) => socket.send(JSON.stringify(payload)),
    close: () => socket.close(),
    waitFor: (type, timeoutMs = 5000) => {
      const existing = events.find((e) => e.type === type);
      if (existing) return Promise.resolve(existing);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          const idx = waiters.findIndex((w) => w.timer === timer);
          if (idx >= 0) waiters.splice(idx, 1);
          reject(new Error(`timed out waiting for "${type}"`));
        }, timeoutMs);
        waiters.push({ type, resolve, timer });
      });
    },
  };

  await client.waitFor('hello');
  return client;
}

/** Waits until `check` returns true or the timeout elapses. */
export async function waitFor(check: () => boolean | Promise<boolean>, timeoutMs = 5000): Promise<void> {
  const start = Date.now();
  for (;;) {
    if (await check()) return;
    if (Date.now() - start > timeoutMs) throw new Error('waitFor timed out');
    await new Promise((r) => setTimeout(r, 50));
  }
}
