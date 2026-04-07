import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/auth-store';
import { createAuthSessionClient } from './auth-session-client';

const productionApiUrl = 'https://app-backend-rust-seven.vercel.app/api';
const fallbackApiUrl = 'http://localhost:3000/api';
const demoApiHosts = new Set(['localhost', '127.0.0.1', '10.0.2.2', '172.30.132.144']);
const apiFailoverState = {
  activeApiUrl: productionApiUrl,
};

type RequestConfigWithApiFailover = InternalAxiosRequestConfig & {
  _apiBaseUrlAttemptCount?: number;
};

function inferExpoHostApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri?.trim();

  if (!hostUri) {
    return null;
  }

  const [host] = hostUri.split(':');

  if (!host || ['localhost', '127.0.0.1'].includes(host)) {
    return null;
  }

  return `http://${host}:3000/api`;
}

function isExpoGoOnPhysicalDevice() {
  return Constants.executionEnvironment === 'storeClient';
}

function isStandaloneBuild() {
  return Constants.executionEnvironment === 'standalone';
}

function isLocalOnlyHostname(hostname: string) {
  return ['localhost', '127.0.0.1', '10.0.2.2'].includes(hostname);
}

function resolveConfiguredApiUrl() {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl;

  if (!configuredApiUrl) {
    return null;
  }

  const trimmed = configuredApiUrl.trim();

  if (!trimmed || trimmed.includes('YOUR_LAN_IP')) {
    return null;
  }

  // `10.0.2.2` only works inside the Android emulator. When the app is opened in
  // Expo Go on a physical device, prefer inferring the host machine's LAN IP.
  if (isExpoGoOnPhysicalDevice() && trimmed.includes('10.0.2.2')) {
    return null;
  }

  return trimmed;
}

function normalizeApiUrl(input: string) {
  const trimmed = input.trim().replace(/\/+$/, '');

  if (!trimmed) {
    return fallbackApiUrl;
  }

  try {
    const parsed = new URL(trimmed);

    if (Platform.OS === 'android' && ['localhost', '127.0.0.1'].includes(parsed.hostname)) {
      parsed.hostname = '10.0.2.2';
    }

    if (!parsed.pathname || parsed.pathname === '/') {
      parsed.pathname = '/api';
    }

    return parsed.toString().replace(/\/+$/, '');
  } catch {
    const normalized = Platform.OS === 'android' ? trimmed.replace('localhost', '10.0.2.2') : trimmed;
    return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
  }
}

function resolveConfiguredApiFallbackUrls() {
  const rawFallbackUrls =
    process.env.EXPO_PUBLIC_API_URL_FALLBACKS ?? Constants.expoConfig?.extra?.apiUrlFallbacks;

  if (!rawFallbackUrls || typeof rawFallbackUrls !== 'string') {
    return [];
  }

  return rawFallbackUrls
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function dedupeUrls(urls: string[]) {
  return [...new Set(urls)];
}

function buildCandidateApiUrls() {
  const configuredApiUrl = resolveConfiguredApiUrl();
  const inferredExpoHostApiUrl = inferExpoHostApiUrl();
  const configuredFallbackUrls = resolveConfiguredApiFallbackUrls();

  const rawCandidates = isStandaloneBuild()
    ? [configuredApiUrl, productionApiUrl, ...configuredFallbackUrls, inferredExpoHostApiUrl, fallbackApiUrl]
    : [inferredExpoHostApiUrl, configuredApiUrl, productionApiUrl, ...configuredFallbackUrls, fallbackApiUrl];

  return dedupeUrls(
    rawCandidates
      .filter((value): value is string => Boolean(value))
      .map((value) => normalizeApiUrl(value)),
  );
}

export const candidateApiUrls = buildCandidateApiUrls();
apiFailoverState.activeApiUrl = candidateApiUrls[0] ?? normalizeApiUrl(productionApiUrl);

export function getActiveApiUrl() {
  return apiFailoverState.activeApiUrl;
}

export function getResolvedApiUrl() {
  return getActiveApiUrl();
}

export const resolvedApiUrl = getResolvedApiUrl();

export function isSeededDemoApiUrl(input: string) {
  try {
    const parsed = new URL(input);
    return demoApiHosts.has(parsed.hostname);
  } catch {
    return false;
  }
}

function resolveApiConfigError() {
  if (!isExpoGoOnPhysicalDevice()) {
    return null;
  }

  const inferredExpoHostApiUrl = inferExpoHostApiUrl();

  if (inferredExpoHostApiUrl) {
    return null;
  }

  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl;
  const trimmedConfiguredApiUrl = configuredApiUrl?.trim() ?? '';

  if (!trimmedConfiguredApiUrl || trimmedConfiguredApiUrl.includes('YOUR_LAN_IP')) {
    return null;
  }

  try {
    const parsed = new URL(trimmedConfiguredApiUrl);

    if (isLocalOnlyHostname(parsed.hostname)) {
      return 'This device cannot reach a localhost API directly. Start Expo in LAN mode on the same network, or let the app use the deployed API.';
    }
  } catch {
    return 'The configured API URL is invalid.';
  }

  return null;
}

export const apiConfigError = resolveApiConfigError();

export const api = axios.create({
  timeout: 10000,
});

const authApi = axios.create({
  timeout: 10000,
});

function installApiBaseUrlFailover(client: typeof api) {
  client.interceptors.request.use((config) => {
    config.baseURL = getActiveApiUrl();
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!axios.isAxiosError(error) || error.response || !error.config) {
        return Promise.reject(error);
      }

      const requestConfig = error.config as RequestConfigWithApiFailover;
      const attemptCount = requestConfig._apiBaseUrlAttemptCount ?? 0;
      const nextApiUrl = candidateApiUrls[attemptCount + 1];

      if (!nextApiUrl) {
        return Promise.reject(error);
      }

      requestConfig._apiBaseUrlAttemptCount = attemptCount + 1;
      apiFailoverState.activeApiUrl = nextApiUrl;
      requestConfig.baseURL = nextApiUrl;

      return client.request(requestConfig);
    },
  );
}

installApiBaseUrlFailover(api);
installApiBaseUrlFailover(authApi);

const authSessionClient = createAuthSessionClient(api, authApi, {
  getSession: () => useAuthStore.getState().session,
  setSession: (session) => useAuthStore.getState().setSession(session),
});

authSessionClient.install();

export async function signOut() {
  await authSessionClient.signOut();
}
