"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const axios_1 = __importStar(require("axios"));
const auth_session_client_1 = require("./auth-session-client");
function createSession(overrides = {}) {
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
function createStore(session) {
    let currentSession = session;
    const writes = [];
    return {
        getSession: () => currentSession,
        setSession: async (nextSession) => {
            currentSession = nextSession;
            writes.push(nextSession);
        },
        writes,
    };
}
function createApiClient() {
    let requestHandler = null;
    let responseErrorHandler = null;
    const requestCalls = [];
    return {
        interceptors: {
            request: {
                use: (handler) => {
                    requestHandler = handler;
                },
            },
            response: {
                use: (_handler, errorHandler) => {
                    responseErrorHandler = errorHandler;
                },
            },
        },
        request: async (config) => {
            requestCalls.push(config);
            return { data: { ok: true }, config };
        },
        runRequest: async (config) => {
            strict_1.default.ok(requestHandler);
            return requestHandler(config);
        },
        runUnauthorized: async (error) => {
            strict_1.default.ok(responseErrorHandler);
            return responseErrorHandler(error);
        },
        requestCalls,
    };
}
function createAxiosUnauthorizedError(config) {
    return new axios_1.default.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
        data: { message: 'Unauthorized' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
    });
}
(0, node_test_1.default)('request interceptor attaches the current access token to protected requests', async () => {
    const store = createStore(createSession());
    const api = createApiClient();
    const authApi = {
        post: async () => ({ data: createSession({ accessToken: 'unused', refreshToken: 'unused' }) }),
    };
    const client = (0, auth_session_client_1.createAuthSessionClient)(api, authApi, store);
    client.install();
    const config = await api.runRequest({
        headers: axios_1.AxiosHeaders.from({}),
        method: 'get',
        url: '/students',
    });
    const headers = axios_1.AxiosHeaders.from(config.headers);
    strict_1.default.equal(headers.get('Authorization'), 'Bearer access-token-1');
});
(0, node_test_1.default)('401 on a protected request refreshes the session and retries once with the new token', async () => {
    const store = createStore(createSession());
    const api = createApiClient();
    const refreshedSession = createSession({
        accessToken: 'access-token-2',
        refreshToken: 'refresh-token-2',
    });
    const authApiCalls = [];
    const authApi = {
        post: async (url, body) => {
            authApiCalls.push({ url, body });
            return { data: refreshedSession };
        },
    };
    const client = (0, auth_session_client_1.createAuthSessionClient)(api, authApi, store);
    client.install();
    const originalRequest = {
        headers: axios_1.AxiosHeaders.from({}),
        method: 'get',
        url: '/students',
    };
    const result = await api.runUnauthorized(createAxiosUnauthorizedError(originalRequest));
    strict_1.default.equal(authApiCalls.length, 1);
    strict_1.default.equal(authApiCalls[0]?.url, '/auth/refresh');
    strict_1.default.equal(store.writes.length, 1);
    strict_1.default.equal(store.writes[0]?.accessToken, 'access-token-2');
    strict_1.default.equal(api.requestCalls.length, 1);
    strict_1.default.equal(api.requestCalls[0]?._retry, true);
    strict_1.default.equal(axios_1.AxiosHeaders.from(api.requestCalls[0]?.headers).get('Authorization'), 'Bearer access-token-2');
    strict_1.default.deepEqual(result, { data: { ok: true }, config: api.requestCalls[0] });
});
(0, node_test_1.default)('failed refresh clears the session and does not retry the original request', async () => {
    const store = createStore(createSession());
    const api = createApiClient();
    const authApi = {
        post: async () => {
            throw new Error('refresh failed');
        },
    };
    const client = (0, auth_session_client_1.createAuthSessionClient)(api, authApi, store);
    client.install();
    const originalRequest = {
        headers: axios_1.AxiosHeaders.from({}),
        method: 'get',
        url: '/students',
    };
    await strict_1.default.rejects(() => api.runUnauthorized(createAxiosUnauthorizedError(originalRequest)));
    strict_1.default.deepEqual(store.writes, [null]);
    strict_1.default.equal(api.requestCalls.length, 0);
});
(0, node_test_1.default)('signOut clears local session even when logout API call fails', async () => {
    const store = createStore(createSession());
    const api = createApiClient();
    const authApiCalls = [];
    const authApi = {
        post: async (url, body) => {
            authApiCalls.push({ url, body });
            throw new Error('logout failed');
        },
    };
    const client = (0, auth_session_client_1.createAuthSessionClient)(api, authApi, store);
    await client.signOut();
    strict_1.default.equal(authApiCalls.length, 1);
    strict_1.default.equal(authApiCalls[0]?.url, '/auth/logout');
    strict_1.default.deepEqual(store.writes, [null]);
    strict_1.default.equal(store.getSession(), null);
});
(0, node_test_1.default)('stale refresh results do not overwrite a newer session', async () => {
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
    let resolveRefresh = null;
    const authApi = {
        post: async () => new Promise((resolve) => {
            resolveRefresh = (session) => resolve({ data: session });
        }),
    };
    const client = (0, auth_session_client_1.createAuthSessionClient)(api, authApi, store);
    client.install();
    const originalRequest = {
        headers: axios_1.AxiosHeaders.from({}),
        method: 'get',
        url: '/students',
    };
    const pendingRefresh = api.runUnauthorized(createAxiosUnauthorizedError(originalRequest));
    await Promise.resolve();
    await store.setSession(nextSession);
    if (!resolveRefresh) {
        throw new Error('Refresh promise was not captured');
    }
    const completeRefresh = resolveRefresh;
    completeRefresh(refreshedSession);
    await pendingRefresh;
    strict_1.default.equal(store.getSession()?.refreshToken, 'refresh-token-2');
    strict_1.default.equal(store.writes.at(-1)?.refreshToken, 'refresh-token-2');
});
