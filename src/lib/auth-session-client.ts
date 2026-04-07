import axios, { AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { AuthSession } from '../types/auth';

type SessionStore = {
  getSession: () => AuthSession | null;
  setSession: (session: AuthSession | null) => Promise<void>;
};

type RequestConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

type ApiClient = {
  interceptors: {
    request: {
      use: (onFulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>) => void;
    };
    response: {
      use: (
        onFulfilled: <T>(response: T) => T | Promise<T>,
        onRejected: (error: unknown) => Promise<unknown>,
      ) => void;
    };
  };
  request: (config: RequestConfigWithRetry) => Promise<unknown>;
};

type AuthApiClient = {
  post: <T = unknown>(url: string, body?: unknown) => Promise<{ data: T }>;
};

function isAuthRoute(url?: string) {
  return typeof url === 'string' && /^\/auth\//.test(url);
}

export class AuthSessionClient {
  private refreshSessionPromise: Promise<AuthSession | null> | null = null;

  constructor(
    private readonly api: ApiClient,
    private readonly authApi: AuthApiClient,
    private readonly store: SessionStore,
  ) {}

  install() {
    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => this.attachAccessToken(config));
    this.api.interceptors.response.use(
      <T>(response: T) => response,
      async (error: unknown) => this.handleUnauthorized(error),
    );
  }

  async signOut() {
    const session = this.store.getSession();
    this.refreshSessionPromise = null;

    try {
      if (session?.refreshToken) {
        await this.authApi.post('/auth/logout', {
          refreshToken: session.refreshToken,
        });
      }
    } catch {
      // Local session cleanup should always win even if the network request fails.
    } finally {
      await this.store.setSession(null);
    }
  }

  private attachAccessToken(config: InternalAxiosRequestConfig) {
    const session = this.store.getSession();

    if (session?.accessToken && !isAuthRoute(config.url)) {
      const headers = AxiosHeaders.from(config.headers);

      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
      }

      config.headers = headers;
    }

    return config;
  }

  private async refreshSession() {
    if (this.refreshSessionPromise) {
      return this.refreshSessionPromise;
    }

    this.refreshSessionPromise = (async () => {
      const session = this.store.getSession();
      const expectedRefreshToken = session?.refreshToken;

      if (!expectedRefreshToken) {
        await this.store.setSession(null);
        return null;
      }

      try {
        const { data } = await this.authApi.post<AuthSession>('/auth/refresh', {
          refreshToken: expectedRefreshToken,
        });

        if (this.store.getSession()?.refreshToken === expectedRefreshToken) {
          await this.store.setSession(data);
        }

        return data;
      } catch {
        if (this.store.getSession()?.refreshToken === expectedRefreshToken) {
          await this.store.setSession(null);
        }

        return null;
      } finally {
        this.refreshSessionPromise = null;
      }
    })();

    return this.refreshSessionPromise;
  }

  private async handleUnauthorized(error: unknown) {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RequestConfigWithRetry;

    if (originalRequest._retry || isAuthRoute(originalRequest.url)) {
      if (originalRequest.url === '/auth/refresh') {
        await this.store.setSession(null);
      }

      return Promise.reject(error);
    }

    const refreshedSession = await this.refreshSession();

    if (!refreshedSession?.accessToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const headers = AxiosHeaders.from(originalRequest.headers);
    headers.set('Authorization', `Bearer ${refreshedSession.accessToken}`);
    originalRequest.headers = headers;

    return this.api.request(originalRequest);
  }
}

export function createAuthSessionClient(api: ApiClient, authApi: AuthApiClient, store: SessionStore) {
  return new AuthSessionClient(api, authApi, store);
}
