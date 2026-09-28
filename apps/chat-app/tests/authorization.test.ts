import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  authed,
  registerUser,
  resetDb,
  startTestServer,
  type RegisteredUser,
  type TestServer,
} from './helpers.js';

let srv: TestServer;
let alice: RegisteredUser;
let bob: RegisteredUser;
let mallory: RegisteredUser;
let conversationId: string;
let aliceMessageId: string;

beforeAll(async () => {
  await resetDb();
  srv = await startTestServer();
  alice = await registerUser(srv.httpUrl, { displayName: 'Alice' });
  bob = await registerUser(srv.httpUrl, { displayName: 'Bob' });
  mallory = await registerUser(srv.httpUrl, { displayName: 'Mallory' });

  const res = await authed(srv.httpUrl, alice.accessToken)
    .post('/api/v1/conversations')
    .send({ recipientId: bob.id });
  conversationId = res.body.conversation.id;

  const msg = await authed(srv.httpUrl, alice.accessToken)
    .post(`/api/v1/conversations/${conversationId}/messages`)
    .send({ body: 'private hello' });
  aliceMessageId = msg.body.message.id;
});

afterAll(async () => {
  await srv.close();
});

describe('conversation authorization', () => {
  it('hides a conversation from non-participants (404, not 403)', async () => {
    const paths = [
      ['get', `/api/v1/conversations/${conversationId}`],
      ['get', `/api/v1/conversations/${conversationId}/messages`],
    ] as const;

    for (const [method, path] of paths) {
      const res = await authed(srv.httpUrl, mallory.accessToken)[method](path);
      expect(res.status, path).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    }

    const post = await authed(srv.httpUrl, mallory.accessToken)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .send({ body: 'let me in' });
    expect(post.status).toBe(404);

    const read = await authed(srv.httpUrl, mallory.accessToken)
      .post(`/api/v1/conversations/${conversationId}/read`)
      .send({});
    expect(read.status).toBe(404);
  });

  it('keeps the conversation out of a non-participant list', async () => {
    const list = await authed(srv.httpUrl, mallory.accessToken).get('/api/v1/conversations');
    expect(list.status).toBe(200);
    expect(list.body.conversations.map((c: { id: string }) => c.id)).not.toContain(conversationId);
  });

  it('rejects malformed conversation ids', async () => {
    const res = await authed(srv.httpUrl, alice.accessToken).get(
      '/api/v1/conversations/not-a-uuid',
    );
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('does not let a non-sender delete a message', async () => {
    const res = await authed(srv.httpUrl, mallory.accessToken).delete(
      `/api/v1/messages/${aliceMessageId}`,
    );
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

describe('authentication guard on the whole API', () => {
  it('rejects requests without a token on protected routes', async () => {
    const protectedRoutes: Array<['get' | 'post' | 'patch' | 'delete', string]> = [
      ['get', '/api/v1/users/me'],
      ['patch', '/api/v1/users/me'],
      ['get', '/api/v1/users/search?q=a'],
      ['get', '/api/v1/conversations'],
      ['post', '/api/v1/conversations'],
      ['get', `/api/v1/conversations/${conversationId}/messages`],
      ['post', `/api/v1/conversations/${conversationId}/messages`],
      ['post', `/api/v1/conversations/${conversationId}/read`],
      ['delete', `/api/v1/messages/${aliceMessageId}`],
    ];

    for (const [method, path] of protectedRoutes) {
      const res = await request(srv.httpUrl)[method](path);
      expect(res.status, `${method.toUpperCase()} ${path}`).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('rejects a token signed with the wrong secret', async () => {
    const res = await request(srv.httpUrl)
      .get('/api/v1/users/me')
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDAiLCJ1c2VybmFtZSI6ImhvYWNrZXIiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OTl9.forged-signature',
      );
    expect(res.status).toBe(401);
  });

  it('does not expose stack traces or SQL in error payloads', async () => {
    const res = await authed(srv.httpUrl, alice.accessToken).get(
      '/api/v1/conversations/not-a-uuid',
    );
    const raw = JSON.stringify(res.body);
    expect(raw).not.toMatch(/SELECT|INSERT|UPDATE|pg_|node_modules|at Object\./i);
  });

  it('returns JSON 404 for unknown routes', async () => {
    const res = await request(srv.httpUrl).get('/api/v1/definitely-not-a-route');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
