# Chat App Backend — API Reference

Base URL: `http://localhost:4000` (dev) — all REST routes are prefixed with `/api/v1`.
Realtime: `ws://localhost:4000/ws`.

Content type: `application/json` for every request and response except `204` responses.

---

## 1. Authentication

Two kinds of credentials:

| Credential | Where it lives | Lifetime | Used for |
| --- | --- | --- | --- |
| **Access token** (JWT) | Client memory / storage | `ACCESS_TOKEN_TTL` (default `15m`) | `Authorization: Bearer <token>` on every REST call, and the first WebSocket frame |
| **Refresh token** (opaque, SHA-256 hashed at rest) | `httpOnly` cookie `refresh_token`, `path=/api/v1/auth`, `SameSite=Lax`, `Secure` in production | `REFRESH_TOKEN_TTL_DAYS` (default 30) | Only `POST /auth/refresh` and `POST /auth/logout` |

Rotation: every `/auth/refresh` revokes the presented token and issues a new one. The newest 10 live sessions are kept per user; older ones are deleted.

**Client flow**

```
POST /api/v1/auth/register  ->  { user, accessToken, expiresIn }  + Set-Cookie refresh_token
// use accessToken
GET  /api/v1/users/me       ->  Authorization: Bearer <accessToken>
// when the access token expires (401 UNAUTHORIZED):
POST /api/v1/auth/refresh   ->  { user, accessToken, expiresIn }   (cookie is sent automatically)
POST /api/v1/auth/logout    ->  204, cookie cleared
```

The refresh cookie is scoped to `/api/v1/auth`, so the browser never attaches it to resource routes.

---

## 2. Error format

Every non-2xx REST response uses the same envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Message cannot be empty.",
    "details": { "body": ["Message cannot be empty."] }
  }
}
```

`details` is present only for validation failures (`field -> string[]`).

| `code` | HTTP status |
| --- | --- |
| `VALIDATION_ERROR` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `PAYLOAD_TOO_LARGE` | 413 |
| `RATE_LIMITED` | 429 |
| `INTERNAL_ERROR` | 500 |

Rules the frontend can rely on:

- **Unknown conversation/message ids return `404`, never `403`** — membership must not be probeable.
- **Login and register never reveal whether an account exists** (identical 401 on unknown user and wrong password; `409` with a generic conflict message on duplicate username/email).
- Timestamps are always ISO-8601 UTC strings (`2026-09-28T12:34:56.789Z`).
- Ids are UUIDv4 strings.

---

## 3. Rate limits

Windows are `RATE_LIMIT_WINDOW_MS` (default 60s).

| Limiter | Routes | Default max |
| --- | --- | --- |
| `apiLimiter` | everything under `/api/v1` | 300 |
| `authLimiter` | `/auth/register`, `/auth/login`, `/auth/refresh` | 20 |
| `messageLimiter` | `POST /conversations/:id/messages` | 60 |

Over the limit → `429` with `code: "RATE_LIMITED"` and a `RateLimit-Reset` header. In tests every limit is multiplied by 20.

---

## 4. REST endpoints

### Health

#### `GET /health`

```json
{ "status": "ok", "uptime": 12 }
```
Not rate-limited, not under `/api/v1`.

---

### Auth — `/api/v1/auth`

#### `POST /auth/register` — `201`

```jsonc
{
  "username": "rashid",        // ^[a-z0-9_]{3,32}$, lowercased
  "email": "rashid@example.com",
  "password": "secret123",     // 8–72 chars
  "displayName": "Rashid"      // optional, 1–64 chars, defaults to username
}
```

```jsonc
// 201
{
  "user": {
    "id": "uuid",
    "username": "rashid",
    "displayName": "Rashid",
    "email": "rashid@example.com",
    "bio": null,
    "avatarUrl": null,
    "createdAt": "2026-09-28T12:00:00.000Z"
  },
  "accessToken": "eyJhbGciOi...",
  "expiresIn": 900            // seconds
}
```
Sets `Set-Cookie: refresh_token=...; HttpOnly; Path=/api/v1/auth`.
`409 CONFLICT` if the username or email is taken.

#### `POST /auth/login` — `200`

```json
{ "identifier": "rashid" /* or "rashid@example.com" */, "password": "secret123" }
```
Same response shape as register. `401 UNAUTHORIZED` for unknown user **or** wrong password (identical message).

#### `POST /auth/refresh` — `200`

No body; the cookie carries the token. Returns the same shape as login (rotated refresh cookie is set again).
`401` if the cookie is missing, unknown, revoked or expired.

#### `POST /auth/logout` — `204`

Revokes the presented refresh token and clears the cookie. Safe to call when not logged in.

#### `GET /auth/me` — `200`

```json
{ "user": { /* PublicUser */ } }
```
`401` without a valid access token.

---

### Users — `/api/v1/users` (all require auth)

#### `GET /users/me` — `200`
```json
{ "user": { "id": "uuid", "username": "...", "displayName": "...", "email": "...", "bio": null, "avatarUrl": null, "createdAt": "..." } }
```

#### `PATCH /users/me` — `200`
```jsonc
{
  "displayName": "Rashid A.",   // optional, 1–64
  "bio": "Hello",               // optional, nullable, <=160
  "avatarUrl": "https://…/a.png" // optional, nullable, http(s):// or "/"-relative
}
```
At least one field required → otherwise `400 VALIDATION_ERROR`. Returns `{ user }`.

#### `GET /users/search?q=<term>&limit=20` — `200`
`q` required (1–64 chars), `limit` 1–50 (default 20). Returns users other than the caller:
```json
{ "users": [ { "id": "uuid", "username": "bob", "displayName": "Bob", "bio": null, "avatarUrl": null, "isOnline": false, "lastSeenAt": "…" } ] }
```

#### `GET /users/:username` — `200`
`{ "user": { …same public profile… } }` — `404` if unknown.

---

### Conversations — `/api/v1/conversations` (all require auth)

#### `POST /conversations` — `201` (new) or `200` (already existed)

```json
{ "recipientId": "<user uuid>" }
```
```jsonc
// 200 or 201
{
  "conversation": { /* ConversationDto, see below */ },
  "created": true
}
```
Private conversations are **unique per pair** — calling it again returns the existing one with `created: false`.
`404` if the recipient does not exist/is disabled; `400` if `recipientId` is your own id.
When `created: true`, both participants receive `conversation:new` over WebSocket.

**ConversationDto**

```jsonc
{
  "id": "uuid",
  "type": "private",
  "createdAt": "2026-09-28T12:00:00.000Z",
  "participant": {
    "id": "uuid", "username": "bob", "displayName": "Bob",
    "avatarUrl": null, "isOnline": true,
    "lastSeenAt": "2026-09-28T12:10:00.000Z"
  },
  "lastMessage": { /* MessageDto or null */ },
  "unreadCount": 3
}
```
`lastMessage.status` is always `"sent"` in the list payload — fetch messages for real tick states.

#### `GET /conversations?limit=50` — `200`
```json
{ "conversations": [ /* ConversationDto[] */ ] }
```
Sorted by most recent activity (newest first), `limit` 1–100.

#### `GET /conversations/:conversationId` — `200`
`{ "conversation": ConversationDto }` — `404` if unknown **or** you are not a member.

#### `GET /conversations/:conversationId/messages?limit=50&before=<messageId>` — `200`

```json
{
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "senderId": "uuid",
      "senderUsername": "alice",
      "body": "Hello Bob",
      "status": "read",          // "sent" | "delivered" | "read"
      "deleted": false,
      "createdAt": "2026-09-28T12:00:00.000Z"
    }
  ],
  "hasMore": true
}
```
- `limit` 1–100 (default 50); `before` is a **message id** cursor (not a timestamp).
- Returned **oldest → newest** inside the page; pages are newest-first, so walk backwards with `before=<id of the oldest message you received>`.
- An unknown/expired cursor is ignored and treated as "no cursor".
- `hasMore: true` means older messages exist.
- Fetching advances **your** delivered pointer up to the newest fetched message (so the sender sees `delivered`).
- Deleted messages come back with `body: null`, `deleted: true`.

**Status semantics** (per-message for the *sender's* view):

| For the sender's own message | meaning |
| --- | --- |
| `sent` | recipient has not received it yet |
| `delivered` | recipient's client fetched or acknowledged it |
| `read` | recipient's read pointer passed it |

Messages you received are `delivered`, or `read` once you marked them read.

#### `POST /conversations/:conversationId/messages` — `201`

```json
{ "body": "Hello Bob" }   // trimmed, 1–4000 chars
```
```json
{ "message": { /* MessageDto */ } }
```
`404` if you are not a member. Rate limited by `messageLimiter`.
Over WebSocket both participants receive `message:new` then `conversation:updated`.

#### `POST /conversations/:conversationId/read` — `200`

```json
{ "lastReadMessageId": "uuid" }   // optional
```
```json
{ "lastReadAt": "2026-09-28T12:05:00.000Z", "unreadCount": 0 }
```
Advances your read pointer to *now* (or pins the reference message id). `404` on unknown conversation **or** unknown `lastReadMessageId`.
The other participant receives `message:read` over WebSocket.

---

### Messages — `/api/v1/messages` (auth required)

#### `DELETE /messages/:messageId` — `200`

Soft delete; the row stays for tombstone display.
```json
{ "messageId": "uuid", "deletedAt": "2026-09-28T12:06:00.000Z" }
```
`403 FORBIDDEN` if you are not the author; `404` if unknown; `404` if already deleted.
Both participants receive `message:deleted`.

---

## 5. WebSocket — `/ws`

Connect to `ws://<host>/ws` (same origin; CORS origin list applies to REST only).

### 5.1 Handshake — the first frame MUST authenticate

```
client -> { "type": "auth", "token": "<accessToken>" }
server -> { "type": "hello", "userId": "<uuid>", "serverTime": "2026-09-28T12:00:00.000Z" }
```

- The token is **never** put in the query string — send it in the first JSON frame.
- You have **5 seconds** to authenticate; otherwise the server closes with `4001`.
- Wrong/invalid token → close `4001` immediately.
- After `hello`, presence `online` is announced to your contacts.

**Close codes**

| Code | Meaning |
| --- | --- |
| `1000` | normal |
| `4001` | unauthenticated (bad/missing token, auth timeout) |
| `4003` | policy violation |
| `4008` | timeout |
| `5000` | server error |

### 5.2 Client → server events

```jsonc
{ "type": "ping" }                                                    // -> { "type": "pong", "serverTime": "…" }
{ "type": "typing", "conversationId": "uuid", "isTyping": true }       // relayed to the other participant
{ "type": "message:read", "conversationId": "uuid", "lastReadMessageId": "uuid"? }  // -> relayed as message:read
{ "type": "message:delivered", "conversationId": "uuid" }              // advances your delivered pointer (no reply)
```
An unknown/invalid event yields `{ "type": "error", "code": "VALIDATION_ERROR", "message": "…" }` and the socket stays open.
Send `ping` roughly every 30s as an application-level keepalive (the server also pings at that interval).

### 5.3 Server → client events

```jsonc
{ "type": "hello", "userId": "uuid", "serverTime": "…" }
{ "type": "pong", "serverTime": "…" }

{ "type": "presence:update", "userId": "uuid", "status": "online", "lastSeenAt": "…" }

{ "type": "conversation:new", "conversation": ConversationDto }
{ "type": "conversation:updated", "conversation": ConversationDto }

{ "type": "message:new", "conversationId": "uuid", "message": MessageDto }
{ "type": "message:deleted", "conversationId": "uuid", "messageId": "uuid", "deletedAt": "…" }

{ "type": "typing", "conversationId": "uuid", "userId": "uuid", "isTyping": true }

{ "type": "message:read",
  "conversationId": "uuid",
  "userId": "uuid",
  "lastReadAt": "2026-09-28T12:05:00.000Z",
  "lastReadMessageId": "uuid" | null }

{ "type": "error", "code": "NOT_FOUND", "message": "Conversation not found.", "requestId": "…" }
```

**Routing rules**

- `message:new`, `conversation:new`, `conversation:updated`, `message:deleted`, `message:read` → delivered to **every participant** of the conversation (including the sender), on **all** of their sockets.
- `typing` → only to the other participant.
- `presence:update` → to users who share at least one conversation with the changed user (not a global broadcast).
- Multiple simultaneous sockets per user are supported; each socket receives its own copy.

### 5.4 Recommended client behaviour

1. Connect + `auth` immediately after login / on `401` recovery.
2. Keep `accessToken` in memory, refresh it before expiry; on WS close `4001`, refresh then reconnect (exponential backoff).
3. On reconnect, **resync**: `GET /conversations` and, for each open thread, `GET /conversations/:id/messages` — the socket carries deltas, not history.
4. Call `POST /conversations/:id/read` (or send `message:read`) when the thread is visible.
5. Send `message:delivered` when a message arrives, to flip the sender's tick faster than the next fetch would.
6. Treat `message:new` from yourself as an echo you may ignore (you already rendered your optimistic bubble).
