import type { ExpoConfig } from 'expo/config';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://YOUR_LAN_IP:3000/api';
const defaultProjectId = '1bf36cf1-ec46-499d-a0cf-71468bb1c828';
const rawProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim() || defaultProjectId;
const hasValidProjectId = Boolean(rawProjectId && rawProjectId !== 'your-eas-project-id');
const runtimeVersion = process.env.EXPO_PUBLIC_RUNTIME_VERSION?.trim() || '0.1.0';

const config: ExpoConfig = {
  name: 'SVIT Connect',
  slug: 'svit-connect',
  scheme: 'svit-connect',
  version: runtimeVersion,
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
  runtimeVersion,
  updates: {
    fallbackToCacheTimeout: 0,
    checkAutomatically: 'ON_ERROR_RECOVERY',
    useEmbeddedUpdate: true,
    ...(hasValidProjectId
      ? {
          url: `https://u.expo.dev/${rawProjectId}`,
        }
      : {}),
  },
  extra: {
    apiUrl,
    ...(hasValidProjectId
      ? {
          eas: {
            projectId: rawProjectId,
          },
        }
      : {}),
  },
};

export default config;
