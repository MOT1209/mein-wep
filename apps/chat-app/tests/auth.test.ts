import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { authed, registerUser, resetDb, startTestServer, uniqueUsername, type TestServer } from './helpers.js';

let srv: TestServer;

beforeAll(async () => {
  await resetDb();
  srv = await startTestServer();
});

afterAll(async () => {
  await srv.close();
});

describe('POST /api/v1/auth/register', () => {
  it('creates an account and returns an access token + refresh cookie', async () => {
    const username = uniqueUsername();
    const res = await request(srv.httpUrl).post('/api/v1/auth/register').send({
      username,
      email: `${username}@example.com`,
      password: 'Password123!',
      displayName: 'Rashid',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ username, displayName: 'Rashid' });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.expiresIn).toBeGreaterThan(0);
    expect(res.headers['set-cookie']?.join(';')).toContain('refresh_token=');
    expect(res.headers['set-cookie']?.join(';')).toContain('HttpOnly');
  });

  it('rejects a duplicate username', async () => {
    const user = await registerUser(srv.httpUrl);
    const res = await request(srv.httpUrl).post('/api/v1/auth/register').send({
      username: user.username.toUpperCase(),
      email: `${uniqueUsername()}@example.com`,
      password: 'Password123!',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects a duplicate email', async () => {
    const user = await registerUser(srv.httpUrl);
    const res = await request(srv.httpUrl).post('/api/v1/auth/register').send({
      username: uniqueUsername(),
      email: user.email,
      password: 'Password123!',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects a weak password and a malformed username', async () => {
    const weak = await request(srv.httpUrl).post('/api/v1/auth/register').send({
      username: uniqueUsername(),
      email: `${uniqueUsername()}@example.com`,
      password: 'short',
    });
    expect(weak.status).toBe(400);
    expect(weak.body.error.code).toBe('VALIDATION_ERROR');
    expect(weak.body.error.details.password).toBeDefined();

    const badUser = await request(srv.httpUrl).post('/api/v1/auth/register').send({
      username: 'NO SPACES!',
      email: `${uniqueUsername()}@example.com`,
      password: 'Password123!',
    });
    expect(badUser.status).toBe(400);
    expect(badUser.body.error.details.username).toBeDefined();
  });

  it('never leaks whether an email exists on validation failure', async () => {
    const res = await request(srv.httpUrl).post('/api/v1/auth/register').send({
      username: uniqueUsername(),
      email: 'not-an-email',
      password: 'Password123!',
    });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toContain('already');
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in with email and with username', async () => {
    const user = await registerUser(srv.httpUrl);

    const byEmail = await request(srv.httpUrl).post('/api/v1/auth/login').send({
      identifier: user.email,
      password: user.password,
    });
    expect(byEmail.status).toBe(200);
    expect(byEmail.body.user.id).toBe(user.id);

    const byUsername = await request(srv.httpUrl).post('/api/v1/auth/login').send({
      identifier: user.username.toUpperCase(),
      password: user.password,
    });
    expect(byUsername.status).toBe(200);
    expect(byUsername.body.user.id).toBe(user.id);
  });

  it('returns the same error for unknown user and wrong password', async () => {
    const user = await registerUser(srv.httpUrl);

    const unknown = await request(srv.httpUrl).post('/api/v1/auth/login').send({
      identifier: `${uniqueUsername()}@example.com`,
      password: 'Password123!',
    });
    const wrong = await request(srv.httpUrl).post('/api/v1/auth/login').send({
      identifier: user.email,
      password: 'WrongPassword1!',
    });

    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(unknown.body.error.message).toBe(wrong.body.error.message);
    expect(unknown.body.error.message).not.toMatch(/no user|not found/i);
  });
});

describe('session management', () => {
  it('exposes the current user via /auth/me and rejects missing tokens', async () => {
    const user = await registerUser(srv.httpUrl);

    const anonymous = await request(srv.httpUrl).get('/api/v1/auth/me');
    expect(anonymous.status).toBe(401);
    expect(anonymous.body.error.code).toBe('UNAUTHORIZED');

    const bogus = await request(srv.httpUrl)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not.a.jwt');
    expect(bogus.status).toBe(401);

    const me = await authed(srv.httpUrl, user.accessToken).get('/api/v1/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.username).toBe(user.username);
    expect(me.body.user).not.toHaveProperty('passwordHash');
    expect(me.body.user).not.toHaveProperty('password_hash');
  });

  it('rotates the refresh token and invalidates the old one', async () => {
    const user = await registerUser(srv.httpUrl);

    const first = await request(srv.httpUrl).post('/api/v1/auth/login').send({
      identifier: user.email,
      password: user.password,
    });
    const cookie1 = first.headers['set-cookie']?.find((c: string) => c.startsWith('refresh_token='));
    expect(cookie1).toBeDefined();

    const refreshed = await request(srv.httpUrl)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookie1 as string);
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.accessToken).toBeTruthy();

    const replay = await request(srv.httpUrl)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookie1 as string);
    expect(replay.status).toBe(401);
  });

  it('logout revokes the session', async () => {
    const user = await registerUser(srv.httpUrl);
    const login = await request(srv.httpUrl).post('/api/v1/auth/login').send({
      identifier: user.email,
      password: user.password,
    });
    const cookie = login.headers['set-cookie']?.find((c: string) => c.startsWith('refresh_token='));

    const out = await request(srv.httpUrl)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookie as string);
    expect(out.status).toBe(204);

    const after = await request(srv.httpUrl)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookie as string);
    expect(after.status).toBe(401);
  });

  it('rejects refresh without a cookie', async () => {
    const res = await request(srv.httpUrl).post('/api/v1/auth/refresh');
    expect(res.status).toBe(401);
  });
});
