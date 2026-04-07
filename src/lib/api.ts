import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/auth-store';
import { createAuthSessionClient } from './auth-session-client';

const fallbackApiUrl = 'http://localhost:3000/api';

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

const rawApiUrl =
  resolveConfiguredApiUrl() ??
  inferExpoHostApiUrl() ??
  fallbackApiUrl;

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

export const resolvedApiUrl = normalizeApiUrl(rawApiUrl);

function resolveApiConfigError() {
  if (!isExpoGoOnPhysicalDevice()) {
    return null;
  }

  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl;
  const trimmedConfiguredApiUrl = configuredApiUrl?.trim() ?? '';

  if (!trimmedConfiguredApiUrl || trimmedConfiguredApiUrl.includes('YOUR_LAN_IP')) {
    return 'Set EXPO_PUBLIC_API_URL to your public API tunnel URL before signing in.';
  }

  try {
    const parsed = new URL(trimmedConfiguredApiUrl);

    if (isLocalOnlyHostname(parsed.hostname)) {
      return 'Expo Go on a phone cannot use localhost, 127.0.0.1, or 10.0.2.2. Set EXPO_PUBLIC_API_URL to your public API tunnel URL.';
    }
  } catch {
    return 'EXPO_PUBLIC_API_URL is invalid. Set it to your public API tunnel URL.';
  }

  return null;
}

export const apiConfigError = resolveApiConfigError();

export const api = axios.create({
  baseURL: resolvedApiUrl,
  timeout: 10000,
});

const authApi = axios.create({
  baseURL: resolvedApiUrl,
  timeout: 10000,
});

const authSessionClient = createAuthSessionClient(api, authApi, {
  getSession: () => useAuthStore.getState().session,
  setSession: (session) => useAuthStore.getState().setSession(session),
});

authSessionClient.install();

export async function signOut() {
  await authSessionClient.signOut();
}
