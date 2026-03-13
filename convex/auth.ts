import { expo } from '@better-auth/expo';
import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex as convexPlugin } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth/minimal';
import { components } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import authConfig from './auth.config';

const authBaseUrl = process.env.CONVEX_SITE_URL ?? process.env.EXPO_PUBLIC_CONVEX_SITE_URL ?? '';

const trustedOrigins = [
  process.env.SITE_URL,
  process.env.EXPO_PUBLIC_APP_URL,
  process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:3000',
  'naukaliluka://',
].filter((origin): origin is string => Boolean(origin));

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: authBaseUrl,
    secret: process.env.BETTER_AUTH_SECRET ?? 'naukaliluka-development-secret-change-me-now',
    database: authComponent.adapter(ctx),
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      convexPlugin({
        authConfig,
      }),
      expo(),
    ],
  });

export const { getAuthUser } = authComponent.clientApi();
