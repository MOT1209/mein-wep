/**
 * In-memory presence registry.
 * Keyed by userId -> set of live socket ids, so a user with two tabs stays
 * "online" until the last connection drops.
 *
 * Single-process by design. Moving to a multi-instance deployment means
 * swapping this for Redis pub/sub — the exported API is the seam.
 */
const socketsByUser = new Map<string, Set<string>>();
const connectedAt = new Map<string, number>();

export function addConnection(userId: string, socketId: string): void {
  let set = socketsByUser.get(userId);
  if (!set) {
    set = new Set();
    socketsByUser.set(userId, set);
  }
  const wasOffline = set.size === 0;
  set.add(socketId);
  if (wasOffline) connectedAt.set(userId, Date.now());
}

/** Returns true when this was the user's last connection (user is now offline). */
export function removeConnection(userId: string, socketId: string): boolean {
  const set = socketsByUser.get(userId);
  if (!set) return true;
  set.delete(socketId);
  if (set.size === 0) {
    socketsByUser.delete(userId);
    connectedAt.delete(userId);
    return true;
  }
  return false;
}

export function isOnline(userId: string): boolean {
  return (socketsByUser.get(userId)?.size ?? 0) > 0;
}

export function onlineUserIds(): string[] {
  return [...socketsByUser.keys()];
}

export function onlineUserSet(ids: string[]): Set<string> {
  const set = new Set<string>();
  for (const id of ids) if (isOnline(id)) set.add(id);
  return set;
}

export function connectionCount(userId: string): number {
  return socketsByUser.get(userId)?.size ?? 0;
}

/** Test helper — wipes all presence state between suites. */
export function resetPresence(): void {
  socketsByUser.clear();
  connectedAt.clear();
}
