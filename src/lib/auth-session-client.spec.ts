import test from 'node:test';
import assert from 'node:assert/strict';
import axios, { AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { createAuthSessionClient } from './auth-session-client';
import type { AuthSession } from '../types/auth';

type RequestHandler = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
type ResponseErrorHandler = (error: unknown) => Promise<unknown>;

function createSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    accessToken: 'access-token-1',
    refreshToken: 'refresh-token-1',
    user: {
      id: 'user-1',
      email: 'student@svit.edu',
      role: 'STUDENT',
    },
    ...overrides,
  };
}

function createStore(session: AuthSession | null) {
  let currentSession = session;
  const writes: Array<AuthSession | null> = [];

  return {
    getSession: () => currentSession,
    setSession: async (nextSession: AuthSession | null) => {
      currentSession = nextSession;
      writes.push(nextSession);
    },
    writes,
  };
}

function createApiClient() {
  let requestHandler: RequestHandler | null = null;
  let responseErrorHandler: ResponseErrorHandler | null = null;
  const requestCalls: Array<InternalAxiosRequestConfig & { _retry?: boolean }> = [];

  return {
    interceptors: {
      request: {
        use: (handler: RequestHandler) => {
          requestHandler = handler;
        },
      },
      response: {
        use: (_handler: <T>(response: T) => T | Promise<T>, errorHandler: ResponseErrorHandler) => {
          responseErrorHandler = errorHandler;
        },
      },
    },
    request: async (config: InternalAxiosRequestConfig & { _retry?: boolean }) => {
      requestCalls.push(config);
      return { data: { ok: true }, config };
    },
    runRequest: async (config: InternalAxiosRequestConfig) => {
      assert.ok(requestHandler);
      return requestHandler(config);
    },
    runUnauthorized: async (error: unknown) => {
      assert.ok(responseErrorHandler);
      return responseErrorHandler(error);
    },
    requestCalls,
  };
}

function createAxiosUnauthorizedError(config: InternalAxiosRequestConfig) {
  return new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
    data: { message: 'Unauthorized' },
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  });
}

test('request interceptor attaches the current access token to protected requests', async () => {
  const store = createStore(createSession());
  const api = createApiClient();
  const authApi = {
    post: async <T>() => ({ data: createSession({ accessToken: 'unused', refreshToken: 'unused' }) as T }),
  };
  const client = createAuthSessionClient(api, authApi, store);

  client.install();

  const config = await api.runRequest({
    headers: AxiosHeaders.from({}),
    method: 'get',
    url: '/students',
  } as InternalAxiosRequestConfig);

  const headers = AxiosHeaders.from(config.headers);
  assert.equal(headers.get('Authorization'), 'Bearer access-token-1');
});

test('401 on a protected request refreshes the session and retries once with the new token', async () => {
  const store = createStore(createSession());
  const api = createApiClient();
  const refreshedSession = createSession({
    accessToken: 'access-token-2',
    refreshToken: 'refresh-token-2',
  });
  const authApiCalls: Array<{ url: string; body?: unknown }> = [];
  const authApi = {
    post: async <T>(url: string, body?: unknown) => {
      authApiCalls.push({ url, body });
      return { data: refreshedSession as T };
    },
  };
  const client = createAuthSessionClient(api, authApi, store);

  client.install();

  const originalRequest = {
    headers: AxiosHeaders.from({}),
    method: 'get',
    url: '/students',
  } as InternalAxiosRequestConfig & { _retry?: boolean };

  const result = await api.runUnauthorized(createAxiosUnauthorizedError(originalRequest));

  assert.equal(authApiCalls.length, 1);
  assert.equal(authApiCalls[0]?.url, '/auth/refresh');
  assert.equal(store.writes.length, 1);
  assert.equal(store.writes[0]?.accessToken, 'access-token-2');
  assert.equal(api.requestCalls.length, 1);
  assert.equal(api.requestCalls[0]?._retry, true);
  assert.equal(AxiosHeaders.from(api.requestCalls[0]?.headers).get('Authorization'), 'Bearer access-token-2');
  assert.deepEqual(result, { data: { ok: true }, config: api.requestCalls[0] });
});

test('failed refresh clears the session and does not retry the original request', async () => {
  const store = createStore(createSession());
  const api = createApiClient();
  const authApi = {
    post: async () => {
      throw new Error('refresh failed');
    },
  };
  const client = createAuthSessionClient(api, authApi, store);

  client.install();

  const originalRequest = {
    headers: AxiosHeaders.from({}),
    method: 'get',
    url: '/students',
  } as InternalAxiosRequestConfig & { _retry?: boolean };

  await assert.rejects(() => api.runUnauthorized(createAxiosUnauthorizedError(originalRequest)));
  assert.deepEqual(store.writes, [null]);
  assert.equal(api.requestCalls.length, 0);
});

test('signOut clears local session even when logout API call fails', async () => {
  const store = createStore(createSession());
  const api = createApiClient();
  const authApiCalls: Array<{ url: string; body?: unknown }> = [];
  const authApi = {
    post: async (url: string, body?: unknown) => {
      authApiCalls.push({ url, body });
      throw new Error('logout failed');
    },
  };
  const client = createAuthSessionClient(api, authApi, store);

  await client.signOut();

  assert.equal(authApiCalls.length, 1);
  assert.equal(authApiCalls[0]?.url, '/auth/logout');
  assert.deepEqual(store.writes, [null]);
  assert.equal(store.getSession(), null);
});

test('stale refresh results do not overwrite a newer session', async () => {
  const originalSession = createSession();
  const nextSession = createSession({
    accessToken: 'access-token-2',
    refreshToken: 'refresh-token-2',
  });
  const refreshedSession = createSession({
    accessToken: 'access-token-3',
    refreshToken: 'refresh-token-3',
  });
  const store = createStore(originalSession);
  const api = createApiClient();
  let resolveRefresh: ((session: AuthSession) => void) | null = null;
  const authApi = {
    post: async <T>() =>
      new Promise<{ data: T }>((resolve) => {
        resolveRefresh = (session) => resolve({ data: session as T });
      }),
  };
  const client = createAuthSessionClient(api, authApi, store);

  client.install();

  const originalRequest = {
    headers: AxiosHeaders.from({}),
    method: 'get',
    url: '/students',
  } as InternalAxiosRequestConfig & { _retry?: boolean };

  const pendingRefresh = api.runUnauthorized(createAxiosUnauthorizedError(originalRequest));
  await Promise.resolve();
  await store.setSession(nextSession);
  if (!resolveRefresh) {
    throw new Error('Refresh promise was not captured');
  }
  const completeRefresh: (session: AuthSession) => void = resolveRefresh;
  completeRefresh(refreshedSession);
  await pendingRefresh;

  assert.equal(store.getSession()?.refreshToken, 'refresh-token-2');
  assert.equal(store.writes.at(-1)?.refreshToken, 'refresh-token-2');
});
