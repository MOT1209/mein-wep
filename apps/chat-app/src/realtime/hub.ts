import type { WebSocket } from 'ws';
import { logger } from '../lib/logger.js';
import type { ServerEvent } from './events.js';

interface Client {
  id: string;
  userId: string;
  socket: WebSocket;
}

const clientsByUser = new Map<string, Set<Client>>();
let nextClientId = 1;

export function registerClient(userId: string, socket: WebSocket): Client {
  const client: Client = { id: `c${nextClientId++}`, userId, socket };
  let set = clientsByUser.get(userId);
  if (!set) {
    set = new Set();
    clientsByUser.set(userId, set);
  }
  set.add(client);
  return client;
}

export function unregisterClient(client: Client): void {
  const set = clientsByUser.get(client.userId);
  if (!set) return;
  set.delete(client);
  if (set.size === 0) clientsByUser.delete(client.userId);
}

export function clientsOf(userId: string): Client[] {
  return [...(clientsByUser.get(userId) ?? [])];
}

export function sendToClient(client: Client, event: ServerEvent): void {
  if (client.socket.readyState !== client.socket.OPEN) return;
  client.socket.send(JSON.stringify(event));
}

export function sendToUser(userId: string, event: ServerEvent): number {
  let sent = 0;
  for (const client of clientsOf(userId)) {
    sendToClient(client, event);
    sent += 1;
  }
  return sent;
}

export function sendToUsers(userIds: Iterable<string>, event: ServerEvent): number {
  let sent = 0;
  const seen = new Set<string>();
  for (const id of userIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    sent += sendToUser(id, event);
  }
  return sent;
}

export function connectedUserIds(): string[] {
  return [...clientsByUser.keys()];
}

export function resetHub(): void {
  clientsByUser.clear();
  logger.debug('realtime hub reset');
}
