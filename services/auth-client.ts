import { expoClient } from '@better-auth/expo/client';
import { convexClient } from '@convex-dev/better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

function deriveAuthBaseUrl() {
  if (process.env.EXPO_PUBLIC_CONVEX_SITE_URL) {
    return process.env.EXPO_PUBLIC_CONVEX_SITE_URL;
  }

  if (!process.env.EXPO_PUBLIC_CONVEX_URL) {
    return '';
  }

  return process.env.EXPO_PUBLIC_CONVEX_URL.replace('.convex.cloud', '.convex.site');
}

export const authBaseUrl = deriveAuthBaseUrl();

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [
    convexClient(),
    expoClient({
      scheme: 'naukaliluka',
      storagePrefix: 'naukaliluka-auth',
      storage: SecureStore,
    }),
  ],
});

export function isAuthConfigured() {
  return Boolean(authBaseUrl);
}
