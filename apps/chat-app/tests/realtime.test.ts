import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import {
  authed,
  connectWs,
  registerUser,
  resetDb,
  startTestServer,
  waitFor,
  type RegisteredUser,
  type TestServer,
  type WsTestClient,
} from './helpers.js';

let srv: TestServer;
let alice: RegisteredUser;
let bob: RegisteredUser;
let conversationId: string;

beforeAll(async () => {
  await resetDb();
  srv = await startTestServer();
  alice = await registerUser(srv.httpUrl, { displayName: 'Alice' });
  bob = await registerUser(srv.httpUrl, { displayName: 'Bob' });

  const res = await authed(srv.httpUrl, alice.accessToken)
    .post('/api/v1/conversations')
    .send({ recipientId: bob.id });
  conversationId = res.body.conversation.id;
});

afterAll(async () => {
  await srv.close();
});

describe('websocket authentication', () => {
  it('closes the socket when no auth frame is sent', async () => {
    const socket = new WebSocket(srv.wsUrl);
    const code = await new Promise<number>((resolve) => {
      socket.on('close', (c) => resolve(c));
      socket.on('open', () => socket.send(JSON.stringify({ type: 'typing', conversationId })));
    });
    expect(code).toBe(4001);
  });

  it('closes the socket for a bad token', async () => {
    const socket = new WebSocket(srv.wsUrl);
    const code = await new Promise<number>((resolve) => {
      socket.on('close', (c) => resolve(c));
      socket.on('open', () => socket.send(JSON.stringify({ type: 'auth', token: 'garbage' })));
    });
    expect(code).toBe(4001);
  });

  it('answers ping with pong after a valid handshake', async () => {
    const client = await connectWs(srv.wsUrl, alice.accessToken);
    client.send({ type: 'ping' });
    const pong = await client.waitFor('pong');
    expect(pong.serverTime).toBeTruthy();
    client.close();
  });
});

describe('realtime message flow', () => {
  let aliceWs!: WsTestClient;
  let bobWs!: WsTestClient;

  beforeAll(async () => {
    aliceWs = await connectWs(srv.wsUrl, alice.accessToken);
    bobWs = await connectWs(srv.wsUrl, bob.accessToken);
  });

  afterAll(() => {
    aliceWs?.close();
    bobWs?.close();
  });

  it('delivers a new message to the recipient in real time', async () => {
    await authed(srv.httpUrl, alice.accessToken)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .send({ body: 'realtime hello' });

    const event = await bobWs.waitFor('message:new');
    expect(event.conversationId).toBe(conversationId);
    const message = event.message as { body: string; senderId: string; status: string };
    expect(message.body).toBe('realtime hello');
    expect(message.senderId).toBe(alice.id);
    expect(message.status).toBe('sent');
  });

  it('does not echo typing indicators back to the sender', async () => {
    aliceWs.send({ type: 'typing', conversationId, isTyping: true });

    const received = await bobWs.waitFor('typing');
    expect(received).toMatchObject({ conversationId, userId: alice.id, isTyping: true });

    await new Promise((r) => setTimeout(r, 150));
    expect(aliceWs.events.filter((e) => e.type === 'typing')).toHaveLength(0);
  });

  it('broadcasts read receipts to the counterpart', async () => {
    bobWs.send({ type: 'message:read', conversationId });
    const event = await aliceWs.waitFor('message:read');
    expect(event).toMatchObject({ conversationId, userId: bob.id });
    expect(typeof event.lastReadAt).toBe('string');
  });

  it('advances the delivered pointer when the recipient acknowledges', async () => {
    const fresh = await authed(srv.httpUrl, alice.accessToken)
      .post('/api/v1/conversations')
      .send({ recipientId: bob.id });
    const freshId = fresh.body.conversation.id;

    await authed(srv.httpUrl, alice.accessToken)
      .post(`/api/v1/conversations/${freshId}/messages`)
      .send({ body: 'needs delivery' });

    bobWs.send({ type: 'message:delivered', conversationId: freshId });
    const newestBody = async () => {
      const list = await authed(srv.httpUrl, alice.accessToken).get(
        `/api/v1/conversations/${freshId}/messages`,
      );
      return (list.body.messages as Array<{ body: string; status: string }>).find(
        (m) => m.body === 'needs delivery',
      )?.status;
    };

    await waitFor(async () => (await newestBody()) === 'delivered');
    expect(await newestBody()).toBe('delivered');
  });

  it('rejects malformed client frames without dropping the connection', async () => {
    aliceWs.send('not json at all');
    const err = await aliceWs.waitFor('error');
    expect(err.code).toBe('VALIDATION_ERROR');

    aliceWs.send({ type: 'typing', conversationId: 'nope' });
    const err2 = await aliceWs.waitFor('error');
    expect(err2.code).toBe('VALIDATION_ERROR');

    aliceWs.send({ type: 'ping' });
    await aliceWs.waitFor('pong');
  });

  it('hides conversation membership behind a 404 for strangers', async () => {
    const stranger = await registerUser(srv.httpUrl);
    const strangerWs = await connectWs(srv.wsUrl, stranger.accessToken);
    strangerWs.send({ type: 'typing', conversationId, isTyping: true });
    const err = await strangerWs.waitFor('error');
    expect(err.code).toBe('NOT_FOUND');
    strangerWs.close();
  });
});

describe('presence', () => {
  it('announces online and offline to users who share a conversation', async () => {
    const bobWs = await connectWs(srv.wsUrl, bob.accessToken);
    const aliceWs = await connectWs(srv.wsUrl, alice.accessToken);

    await waitFor(() =>
      bobWs.events.some(
        (e) => e.type === 'presence:update' && e.userId === alice.id && e.status === 'online',
      ),
    );

    const presenceList = await authed(srv.httpUrl, bob.accessToken).get(
      `/api/v1/users/${alice.username}`,
    );
    expect(presenceList.body.user.isOnline).toBe(true);

    aliceWs.close();

    await waitFor(async () => {
      const res = await authed(srv.httpUrl, bob.accessToken).get(
        `/api/v1/users/${alice.username}`,
      );
      return res.body.user.isOnline === false;
    });

    await waitFor(() =>
      bobWs.events.some(
        (e) => e.type === 'presence:update' && e.userId === alice.id && e.status === 'offline',
      ),
    );

    bobWs.close();
  });
});
