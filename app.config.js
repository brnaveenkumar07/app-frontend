"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultProductionApiUrl = 'https://app-backend-rust-seven.vercel.app/api';
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? defaultProductionApiUrl;
const apiUrlFallbacks = process.env.EXPO_PUBLIC_API_URL_FALLBACKS ?? '';
const defaultProjectId = '1bf36cf1-ec46-499d-a0cf-71468bb1c828';
const rawProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim() || defaultProjectId;
const hasValidProjectId = Boolean(rawProjectId && rawProjectId !== 'your-eas-project-id');
const runtimeVersion = process.env.EXPO_PUBLIC_RUNTIME_VERSION?.trim() || '0.1.0';
const config = {
    name: 'CampusFlow',
    slug: 'campus-flow',
    owner: 'brnaveenkumar07',
    scheme: 'campus-flow',
    version: runtimeVersion,
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    android: {
        package: 'com.brnaveenkumar07.campusflow',
    },
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
        apiUrlFallbacks,
        ...(hasValidProjectId
            ? {
                eas: {
                    projectId: rawProjectId,
                },
            }
            : {}),
    },
};
exports.default = config;
