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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSessionClient = void 0;
exports.createAuthSessionClient = createAuthSessionClient;
const axios_1 = __importStar(require("axios"));
function isAuthRoute(url) {
    return typeof url === 'string' && /^\/auth\//.test(url);
}
class AuthSessionClient {
    api;
    authApi;
    store;
    refreshSessionPromise = null;
    constructor(api, authApi, store) {
        this.api = api;
        this.authApi = authApi;
        this.store = store;
    }
    install() {
        this.api.interceptors.request.use((config) => this.attachAccessToken(config));
        this.api.interceptors.response.use((response) => response, async (error) => this.handleUnauthorized(error));
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
        }
        catch {
            // Local session cleanup should always win even if the network request fails.
        }
        finally {
            await this.store.setSession(null);
        }
    }
    attachAccessToken(config) {
        const session = this.store.getSession();
        if (session?.accessToken && !isAuthRoute(config.url)) {
            const headers = axios_1.AxiosHeaders.from(config.headers);
            if (!headers.has('Authorization')) {
                headers.set('Authorization', `Bearer ${session.accessToken}`);
            }
            config.headers = headers;
        }
        return config;
    }
    async refreshSession() {
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
                const { data } = await this.authApi.post('/auth/refresh', {
                    refreshToken: expectedRefreshToken,
                });
                if (this.store.getSession()?.refreshToken === expectedRefreshToken) {
                    await this.store.setSession(data);
                }
                return data;
            }
            catch {
                if (this.store.getSession()?.refreshToken === expectedRefreshToken) {
                    await this.store.setSession(null);
                }
                return null;
            }
            finally {
                this.refreshSessionPromise = null;
            }
        })();
        return this.refreshSessionPromise;
    }
    async handleUnauthorized(error) {
        if (!axios_1.default.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
            return Promise.reject(error);
        }
        const originalRequest = error.config;
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
        const headers = axios_1.AxiosHeaders.from(originalRequest.headers);
        headers.set('Authorization', `Bearer ${refreshedSession.accessToken}`);
        originalRequest.headers = headers;
        return this.api.request(originalRequest);
    }
}
exports.AuthSessionClient = AuthSessionClient;
function createAuthSessionClient(api, authApi, store) {
    return new AuthSessionClient(api, authApi, store);
}
