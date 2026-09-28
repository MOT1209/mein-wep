import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { authed, registerUser, resetDb, startTestServer, type RegisteredUser, type TestServer } from './helpers.js';

let srv: TestServer;
let alice: RegisteredUser;
let bob: RegisteredUser;

async function startConversation(a: RegisteredUser, b: RegisteredUser) {
  const res = await authed(srv.httpUrl, a.accessToken).post('/api/v1/conversations').send({
    recipientId: b.id,
  });
  return res;
}

beforeAll(async () => {
  await resetDb();
  srv = await startTestServer();
  alice = await registerUser(srv.httpUrl, { displayName: 'Alice' });
  bob = await registerUser(srv.httpUrl, { displayName: 'Bob' });
});

afterAll(async () => {
  await srv.close();
});

describe('POST /api/v1/conversations', () => {
  it('creates a private conversation and reuses it on the second call', async () => {
    const first = await startConversation(alice, bob);
    expect(first.status, JSON.stringify(first.body)).toBe(201);
    expect(first.body.created).toBe(true);
    expect(first.body.conversation.type).toBe('private');
    expect(first.body.conversation.participant.id).toBe(bob.id);
    expect(first.body.conversation.participant.username).toBe(bob.username);

    const second = await startConversation(alice, bob);
    expect(second.status).toBe(200);
    expect(second.body.created).toBe(false);
    expect(second.body.conversation.id).toBe(first.body.conversation.id);

    const fromBob = await startConversation(bob, alice);
    expect(fromBob.body.conversation.id).toBe(first.body.conversation.id);
  });

  it('refuses self-conversations and unknown recipients', async () => {
    const self = await authed(srv.httpUrl, alice.accessToken)
      .post('/api/v1/conversations')
      .send({ recipientId: alice.id });
    expect(self.status).toBe(400);
    expect(self.body.error.code).toBe('VALIDATION_ERROR');

    const unknown = await authed(srv.httpUrl, alice.accessToken)
      .post('/api/v1/conversations')
      .send({ recipientId: '00000000-0000-4000-8000-000000000000' });
    expect(unknown.status).toBe(404);
  });
});

describe('GET /api/v1/conversations', () => {
  it('lists conversations for both participants with unread counts', async () => {
    const list = await authed(srv.httpUrl, alice.accessToken).get('/api/v1/conversations');
    expect(list.status).toBe(200);
    const entry = list.body.conversations.find((c: { id: string }) =>
      c.participant.id === bob.id,
    );
    expect(entry).toBeDefined();
    expect(entry.unreadCount).toBe(0);
    expect(entry.participant.isOnline).toBe(false);
    expect(entry.participant.lastSeenAt).toBeTypeOf('string');
  });
});

describe('messages', () => {
  let conversationId: string;

  beforeAll(async () => {
    const res = await startConversation(alice, bob);
    conversationId = res.body.conversation.id;
  });

  it('sends a message with a timestamp and sent status', async () => {
    const sent = await authed(srv.httpUrl, alice.accessToken)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .send({ body: 'Hello Bob' });

    expect(sent.status).toBe(201);
    expect(sent.body.message).toMatchObject({
      conversationId,
      senderId: alice.id,
      senderUsername: alice.username,
      body: 'Hello Bob',
      status: 'sent',
      deleted: false,
    });
    expect(Date.parse(sent.body.message.createdAt)).not.toBeNaN();
  });

  it('rejects empty and oversized messages', async () => {
    const empty = await authed(srv.httpUrl, alice.accessToken)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .send({ body: '   ' });
    expect(empty.status).toBe(400);

    const huge = await authed(srv.httpUrl, alice.accessToken)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .send({ body: 'x'.repeat(4001) });
    expect(huge.status).toBe(400);
    expect(huge.body.error.details.body).toBeDefined();
  });

  it('returns messages oldest-first and paginates with a cursor', async () => {
    for (let i = 1; i <= 5; i += 1) {
      const res = await authed(srv.httpUrl, alice.accessToken)
        .post(`/api/v1/conversations/${conversationId}/messages`)
        .send({ body: `bulk ${i}` });
      expect(res.status).toBe(201);
    }

    const page1 = await authed(srv.httpUrl, alice.accessToken).get(
      `/api/v1/conversations/${conversationId}/messages?limit=3`,
    );
    expect(page1.status).toBe(200);
    expect(page1.body.messages).toHaveLength(3);
    expect(page1.body.hasMore).toBe(true);

    const bodies = page1.body.messages.map((m: { body: string }) => m.body);
    expect(bodies).toEqual(['bulk 3', 'bulk 4', 'bulk 5']);

    const lastId = page1.body.messages[0].id;
    const page2 = await authed(srv.httpUrl, alice.accessToken).get(
      `/api/v1/conversations/${conversationId}/messages?limit=3&before=${lastId}`,
    );
    expect(page2.status).toBe(200);
    expect(page2.body.messages.map((m: { body: string }) => m.body)).toEqual([
      'Hello Bob',
      'bulk 1',
      'bulk 2',
    ]);

    const ids = [...page1.body.messages, ...page2.body.messages].map((m: { id: string }) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('moves status sent → delivered → read', async () => {
    const fresh = await startConversation(alice, bob);
    const id = fresh.body.conversation.id;

    const sent = await authed(srv.httpUrl, alice.accessToken)
      .post(`/api/v1/conversations/${id}/messages`)
      .send({ body: 'status check' });
    expect(sent.body.message.status).toBe('sent');

    // Bob loads the conversation → delivered.
    await authed(srv.httpUrl, bob.accessToken).get(`/api/v1/conversations/${id}/messages`);
    const delivered = await authed(srv.httpUrl, alice.accessToken).get(
      `/api/v1/conversations/${id}/messages`,
    );
    const deliveredMsg = delivered.body.messages.find(
      (m: { body: string }) => m.body === 'status check',
    );
    expect(deliveredMsg.status).toBe('delivered');

    // Bob marks the conversation read → read.
    const readAck = await authed(srv.httpUrl, bob.accessToken)
      .post(`/api/v1/conversations/${id}/read`)
      .send({});
    expect(readAck.status).toBe(200);
    expect(readAck.body.unreadCount).toBe(0);

    const read = await authed(srv.httpUrl, alice.accessToken).get(
      `/api/v1/conversations/${id}/messages`,
    );
    const readMsg = read.body.messages.find((m: { body: string }) => m.body === 'status check');
    expect(readMsg.status).toBe('read');
  });

  it('counts unread messages for the recipient and resets after read', async () => {
    // Private conversations are reused, so start from a known-zero state.
    const existing = await startConversation(alice, bob);
    const id = existing.body.conversation.id;
    await authed(srv.httpUrl, bob.accessToken).post(`/api/v1/conversations/${id}/read`).send({});

    await authed(srv.httpUrl, alice.accessToken)
      .post(`/api/v1/conversations/${id}/messages`)
      .send({ body: 'unread 1' });
    await authed(srv.httpUrl, alice.accessToken)
      .post(`/api/v1/conversations/${id}/messages`)
      .send({ body: 'unread 2' });

    const bobsList = await authed(srv.httpUrl, bob.accessToken).get('/api/v1/conversations');
    const entry = bobsList.body.conversations.find((c: { id: string }) => c.id === id);
    expect(entry.unreadCount).toBe(2);

    const lastMessageId = (
      await authed(srv.httpUrl, bob.accessToken).get(`/api/v1/conversations/${id}/messages`)
    ).body.messages.at(-1).id;

    await authed(srv.httpUrl, bob.accessToken)
      .post(`/api/v1/conversations/${id}/read`)
      .send({ lastReadMessageId: lastMessageId });

    const afterRead = await authed(srv.httpUrl, bob.accessToken).get('/api/v1/conversations');
    expect(afterRead.body.conversations.find((c: { id: string }) => c.id === id).unreadCount).toBe(0);
  });

  it('soft-deletes own messages but keeps the row', async () => {
    const fresh = await startConversation(alice, bob);
    const id = fresh.body.conversation.id;

    const mine = await authed(srv.httpUrl, alice.accessToken)
      .post(`/api/v1/conversations/${id}/messages`)
      .send({ body: 'delete me' });

    const deleted = await authed(srv.httpUrl, alice.accessToken).delete(
      `/api/v1/messages/${mine.body.message.id}`,
    );
    expect(deleted.status).toBe(200);

    const list = await authed(srv.httpUrl, bob.accessToken).get(
      `/api/v1/conversations/${id}/messages`,
    );
    const tombstone = list.body.messages.find(
      (m: { id: string }) => m.id === mine.body.message.id,
    );
    expect(tombstone.deleted).toBe(true);
    expect(tombstone.body).toBeNull();

    const again = await authed(srv.httpUrl, alice.accessToken).delete(
      `/api/v1/messages/${mine.body.message.id}`,
    );
    expect(again.status).toBe(404);
  });

  it('does not let one participant delete the other participant message', async () => {
    const fresh = await startConversation(alice, bob);
    const id = fresh.body.conversation.id;

    const fromBob = await authed(srv.httpUrl, bob.accessToken)
      .post(`/api/v1/conversations/${id}/messages`)
      .send({ body: 'bobs message' });

    const attempt = await authed(srv.httpUrl, alice.accessToken).delete(
      `/api/v1/messages/${fromBob.body.message.id}`,
    );
    expect(attempt.status).toBe(403);
    expect(attempt.body.error.code).toBe('FORBIDDEN');
  });
});
