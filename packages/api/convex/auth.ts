import { expo } from '@better-auth/expo';
import { createClient } from '@convex-dev/better-auth';
import type { GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth/minimal';
import { components } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import { query } from './_generated/server';
import authConfig from './auth.config';
import { sendEmail } from './lib/email';

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const siteUrl = requireEnv(process.env.SITE_URL, 'SITE_URL');
const appName = process.env.APP_NAME ?? 'Rlist';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function emailCtaButton(url: string, label: string): string {
  return `<a href="${escapeHtmlAttr(url)}" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${escapeHtml(label)}</a>`;
}

function emailCopyPasteUrlSection(url: string): string {
  return `<p style="margin:24px 0 8px;font-size:14px;line-height:1.5;color:#374151;">If the button does not work, copy and paste this URL into your browser:</p><p style="margin:0;padding:12px;background-color:#f3f4f6;border-radius:6px;font-size:13px;line-height:1.5;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#111827;">${escapeHtml(url)}</p>`;
}

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

const trustedOrigins =
  process.env.TRUSTED_ORIGINS?.split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean) ?? [];

const defaultTrustedOrigins = [siteUrl, 'rlist://', 'rlist://*'];

if (process.env.NODE_ENV !== 'production') {
  defaultTrustedOrigins.push('exp://', 'exp://**');
}

const allTrustedOrigins = Array.from(new Set([...defaultTrustedOrigins, ...trustedOrigins]));

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    appName,
    baseURL: siteUrl,
    rateLimit: {
      enabled: true,
      storage: 'database',
    },
    database: authComponent.adapter(ctx),
    trustedOrigins: allTrustedOrigins,
    user: {
      changeEmail: {
        enabled: false,
      },
    },
    emailVerification: {
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: `Verify your email for ${appName}`,
          text: `Verify your email for ${appName}.\n\nUse the link in this email, or copy and paste this URL into your browser:\n\n${url}\n\nIf you did not sign up, you can ignore this message.`,
          html: `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#111827;">Verify your email for <strong>${escapeHtml(appName)}</strong>.</p><p style="margin:0 0 20px;">${emailCtaButton(url, 'Verify email address')}</p>${emailCopyPasteUrlSection(url)}<p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#6b7280;">If you did not sign up, you can ignore this message.</p>`,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: false,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: `Reset your password for ${appName}`,
          text: `You requested a password reset for ${appName}.\n\nUse the link in this email, or copy and paste this URL into your browser:\n\n${url}\n\nIf you did not request this, you can ignore this message.`,
          html: `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#111827;">You requested a password reset for <strong>${escapeHtml(appName)}</strong>.</p><p style="margin:0 0 20px;">${emailCtaButton(url, 'Choose a new password')}</p>${emailCopyPasteUrlSection(url)}<p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#6b7280;">If you did not request this, you can ignore this message.</p>`,
        });
      },
    },
    plugins: [
      // The Expo plugin handles mobile-origin behavior for native clients.
      expo(),
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.getAuthUser(ctx);
  },
});
