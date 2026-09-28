import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { authed, registerUser, resetDb, startTestServer, type TestServer } from './helpers.js';

let srv: TestServer;

beforeAll(async () => {
  await resetDb();
  srv = await startTestServer();
});

afterAll(async () => {
  await srv.close();
});

describe('profile', () => {
  it('returns the signed-in user and updates the profile', async () => {
    const user = await registerUser(srv.httpUrl, { displayName: 'Before Name' });

    const before = await authed(srv.httpUrl, user.accessToken).get('/api/v1/users/me');
    expect(before.status).toBe(200);
    expect(before.body.user.displayName).toBe('Before Name');
    expect(before.body.user.isOnline).toBe(true);

    const patched = await authed(srv.httpUrl, user.accessToken)
      .patch('/api/v1/users/me')
      .send({ displayName: 'Rashid', bio: 'Builds things.', avatarUrl: '/uploads/me.png' });
    expect(patched.status).toBe(200);
    expect(patched.body.user).toMatchObject({
      displayName: 'Rashid',
      bio: 'Builds things.',
      avatarUrl: '/uploads/me.png',
    });

    const after = await authed(srv.httpUrl, user.accessToken).get('/api/v1/users/me');
    expect(after.body.user.displayName).toBe('Rashid');
    expect(after.body.user.email).toBe(user.email);
  });

  it('rejects an empty profile patch and an out-of-range bio', async () => {
    const user = await registerUser(srv.httpUrl);

    const empty = await authed(srv.httpUrl, user.accessToken).patch('/api/v1/users/me').send({});
    expect(empty.status).toBe(400);

    const longBio = await authed(srv.httpUrl, user.accessToken)
      .patch('/api/v1/users/me')
      .send({ bio: 'x'.repeat(200) });
    expect(longBio.status).toBe(400);
    expect(longBio.body.error.details.bio).toBeDefined();

    const badAvatar = await authed(srv.httpUrl, user.accessToken)
      .patch('/api/v1/users/me')
      .send({ avatarUrl: 'javascript:alert(1)' });
    expect(badAvatar.status).toBe(400);
  });

  it('requires authentication for every profile route', async () => {
    const routes: Array<['get' | 'patch', string]> = [
      ['get', '/api/v1/users/me'],
      ['patch', '/api/v1/users/me'],
      ['get', '/api/v1/users/search?q=a'],
      ['get', '/api/v1/users/someone'],
    ];
    for (const [method, path] of routes) {
      const res = await request(srv.httpUrl)[method](path);
      expect(res.status, `${method.toUpperCase()} ${path}`).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    }
  });
});

describe('GET /api/v1/users/search', () => {
  it('finds users by username and display name, and excludes the viewer', async () => {
    const viewer = await registerUser(srv.httpUrl);
    const target = await registerUser(srv.httpUrl, { displayName: 'Unique Display Name' });
    const other = await registerUser(srv.httpUrl);

    const byUsername = await authed(srv.httpUrl, viewer.accessToken).get(
      `/api/v1/users/search?q=${target.username}`,
    );
    expect(byUsername.status).toBe(200);
    expect(byUsername.body.users.map((u: { id: string }) => u.id)).toContain(target.id);

    const byDisplay = await authed(srv.httpUrl, viewer.accessToken).get(
      '/api/v1/users/search?q=unique display',
    );
    expect(byDisplay.body.users.map((u: { id: string }) => u.id)).toContain(target.id);

    const self = await authed(srv.httpUrl, viewer.accessToken).get(
      `/api/v1/users/search?q=${viewer.username}`,
    );
    expect(self.body.users.map((u: { id: string }) => u.id)).not.toContain(viewer.id);

    const none = await authed(srv.httpUrl, viewer.accessToken).get(
      `/api/v1/users/search?q=zzzz${Date.now()}`,
    );
    expect(none.body.users).toEqual([]);

    expect(other.id).toBeTruthy();
  });

  it('requires a query term and caps the page size', async () => {
    const user = await registerUser(srv.httpUrl);

    const missing = await authed(srv.httpUrl, user.accessToken).get('/api/v1/users/search');
    expect(missing.status).toBe(400);

    const tooLarge = await authed(srv.httpUrl, user.accessToken).get(
      '/api/v1/users/search?q=a&limit=999',
    );
    expect(tooLarge.status).toBe(400);
  });
});

describe('GET /api/v1/users/:username', () => {
  it('returns a public profile and 404s for unknown users', async () => {
    const viewer = await registerUser(srv.httpUrl);
    const target = await registerUser(srv.httpUrl, { displayName: 'Findable' });

    const found = await authed(srv.httpUrl, viewer.accessToken).get(
      `/api/v1/users/${target.username}`,
    );
    expect(found.status).toBe(200);
    expect(found.body.user).toMatchObject({
      username: target.username,
      displayName: 'Findable',
      isOnline: false,
    });
    expect(found.body.user.email).toBeUndefined();

    const missing = await authed(srv.httpUrl, viewer.accessToken).get('/api/v1/users/definitely_not_here');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');
  });
});
