import { describe, expect, it } from 'vitest';
import { getTableName } from 'drizzle-orm';
import { Hono } from 'hono';
import { authTables, createAuthGetter, createSessionHelpers, mountAuth } from './index';
import type { AuthEnv } from './index';

describe('authTables', () => {
  it('prefixes every table name', () => {
    const tables = authTables('pkg');
    expect(getTableName(tables.user)).toBe('pkg_ba_user');
    expect(getTableName(tables.session)).toBe('pkg_ba_session');
    expect(getTableName(tables.account)).toBe('pkg_ba_account');
    expect(getTableName(tables.verification)).toBe('pkg_ba_verification');
  });
});

describe('createAuthGetter', () => {
  const tables = authTables('pkgtest');
  const getter = createAuthGetter<AuthEnv>({ db: () => ({}) as never, tables });

  it('returns the same instance for the same env', () => {
    const env = { BETTER_AUTH_SECRET: 's' };
    expect(getter(env)).toBe(getter(env));
  });

  it('returns a fresh instance per env', () => {
    expect(getter({ BETTER_AUTH_SECRET: 'a' })).not.toBe(getter({ BETTER_AUTH_SECRET: 'b' }));
  });

  it('merges static and env-derived plugins into the instance options', () => {
    const staticPlugin = { id: 'static-plugin', version: '1' } as never;
    const conditionalPlugin = { id: 'conditional-plugin', version: '1' } as never;
    const withPlugins = createAuthGetter<AuthEnv & { CAPTCHA?: string }>({
      db: () => ({}) as never,
      tables,
      plugins: (env) => (env.CAPTCHA ? [conditionalPlugin] : []),
    });
    withPlugins({ BETTER_AUTH_SECRET: 's' });
    withPlugins({ BETTER_AUTH_SECRET: 's', CAPTCHA: 'x' });

    const plain = createAuthGetter<AuthEnv>({ db: () => ({}) as never, tables, plugins: [staticPlugin] });
    const instance = plain({ BETTER_AUTH_SECRET: 's' }) as unknown as {
      options: { plugins: Array<{ id: string }> };
    };
    const ids = instance.options.plugins.map((plugin) => plugin.id);
    expect(ids).toContain('bearer');
    expect(ids).toContain('static-plugin');
  });
});

describe('mountAuth', () => {
  const tables = authTables('pkgmount');
  const getter = createAuthGetter<AuthEnv>({ db: () => ({}) as never, tables });

  it('serves better-auth endpoints under the mount path', async () => {
    const app = new Hono<{ Bindings: AuthEnv }>();
    app.route('/api/auth', mountAuth(getter));
    const res = await app.request('/api/auth/ok', {}, { BETTER_AUTH_SECRET: 's' });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });
});

describe('createSessionHelpers', () => {
  function helpersWith(session: { user: { id: string; email: string; name: string } } | null) {
    const getAuth = (() => ({ api: { getSession: async () => session } })) as unknown as Parameters<
      typeof createSessionHelpers<AuthEnv>
    >[0];
    const { currentUser, scopeOf, actorOf } = createSessionHelpers<AuthEnv>(getAuth);
    return { currentUser, scopeOf, actorOf };
  }
  const ctx = () => ({ env: { BETTER_AUTH_SECRET: 's' }, req: { raw: new Request('https://unit.test/x') } }) as never;

  it('resolves the session user and scope', async () => {
    const { currentUser, scopeOf } = helpersWith({ user: { id: 'u1', email: 'a@b.c', name: 'Ada' } });
    expect(await currentUser(ctx())).toEqual({ id: 'u1', email: 'a@b.c', name: 'Ada' });
    expect(await scopeOf(ctx())).toBe('u1');
  });

  it('derives a server-side actor stamp from the session', async () => {
    const { actorOf } = helpersWith({ user: { id: 'u1', email: 'a@b.c', name: 'Ada Lovelace' } });
    expect(await actorOf(ctx())).toEqual({ actorId: 'u1', actorName: 'Ada Lovelace' });
  });

  it('falls back to System when the session name is blank', async () => {
    const { actorOf } = helpersWith({ user: { id: 'u1', email: 'a@b.c', name: '   ' } });
    expect(await actorOf(ctx())).toEqual({ actorId: 'u1', actorName: 'System' });
  });

  it('returns null for anonymous requests', async () => {
    const { currentUser, scopeOf, actorOf } = helpersWith(null);
    expect(await currentUser(ctx())).toBeNull();
    expect(await scopeOf(ctx())).toBeNull();
    expect(await actorOf(ctx())).toBeNull();
  });
});
