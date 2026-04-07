import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { AuthSession } from '../types/auth';

const AUTH_STORAGE_KEY = 'svit-auth-session';
const STORAGE_TIMEOUT_MS = 2000;

type AuthState = {
  session: AuthSession | null;
  hydrated: boolean;
  setSession: (session: AuthSession | null) => Promise<void>;
  hydrate: () => Promise<void>;
};

function withStorageTimeout<T>(operation: Promise<T>) {
  return Promise.race<T>([
    operation,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Secure storage operation timed out'));
      }, STORAGE_TIMEOUT_MS);
    }),
  ]);
}

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<AuthSession>;
  const user = session.user;

  if (!user || typeof user !== 'object') {
    return false;
  }

  return (
    typeof session.accessToken === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string' &&
    ['ADMIN', 'TEACHER', 'STUDENT'].includes(user.role)
  );
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  hydrated: false,
  setSession: async (session) => {
    set({ session });

    try {
      if (session) {
        await withStorageTimeout(SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(session)));
        return;
      }

      await withStorageTimeout(SecureStore.deleteItemAsync(AUTH_STORAGE_KEY));
    } catch {
      // Keep the in-memory session so auth flow is not blocked by storage issues.
    }
  },
  hydrate: async () => {
    try {
      const raw = await withStorageTimeout(SecureStore.getItemAsync(AUTH_STORAGE_KEY));

      if (!raw) {
        set({
          hydrated: true,
          session: null,
        });
        return;
      }

      const parsed = JSON.parse(raw) as unknown;

      if (!isValidSession(parsed)) {
        await withStorageTimeout(SecureStore.deleteItemAsync(AUTH_STORAGE_KEY));
        set({
          hydrated: true,
          session: null,
        });
        return;
      }

      set({
        hydrated: true,
        session: parsed,
      });
    } catch {
      try {
        await withStorageTimeout(SecureStore.deleteItemAsync(AUTH_STORAGE_KEY));
      } catch {
        // Ignore cleanup failures and allow the app to continue unauthenticated.
      }

      set({
        hydrated: true,
        session: null,
      });
    }
  },
}));
