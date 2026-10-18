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
      resetPasswordTokenExpiresIn: 3600,
      sendResetPassword: async ({ user, token }) => {
        const resendApiKey = process.env.RESEND_API_KEY;
        const emailFrom = process.env.EMAIL_FROM ?? 'NaukaLiluka <noreply@naukaliluka.pl>';

        console.log(`[Password Reset] Token for ${user.email}: ${token}`);

        if (!resendApiKey) {
          console.warn(
            '[Password Reset] RESEND_API_KEY not configured — email not sent. Use the token from Convex logs.'
          );
          return;
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailFrom,
            to: user.email,
            subject: 'Resetowanie hasła – NaukaLiluka',
            html: [
              '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">',
              `<h2 style="color:#15432d">Cześć${user.name ? `, ${user.name}` : ''}!</h2>`,
              '<p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w <strong>NaukaLiluka</strong>.</p>',
              '<p>Twój kod resetowania:</p>',
              '<div style="background:#eef6e7;padding:20px;text-align:center;font-size:28px;',
              'font-weight:bold;letter-spacing:3px;border-radius:12px;border:2px solid #c5d9b5;',
              `margin:16px 0;color:#1f3a29">${token}</div>`,
              '<p>Otwórz aplikację NaukaLiluka i wpisz ten kod na ekranie resetowania hasła.</p>',
              '<p style="color:#5b735f;font-size:13px">Kod wygasa za 1 godzinę. Jeśli nie prosiłeś',
              ' o reset hasła, zignoruj tę wiadomość.</p>',
              '</div>',
            ].join(''),
          }),
        });

        if (!response.ok) {
          console.error('[Password Reset] Resend API error:', await response.text());
        }
      },
    },
    plugins: [
      convexPlugin({
        authConfig,
      }),
      expo(),
    ],
  });

export const { getAuthUser } = authComponent.clientApi();
