import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getPool } from './database';

function createAuth() {
 const database = getPool();
 if (!database || !env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL) return null;
 return betterAuth({
  database,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  rateLimit: { enabled: true, storage: 'database' },
  plugins: [magicLink({
   storeToken: 'hashed',
   sendMagicLink: async ({ email, url }) => {
    if (!env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM) throw new Error('Sign-in email is not configured');
    const response = await fetch('https://api.resend.com/emails', {
     method: 'POST',
     headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
     body: JSON.stringify({ from: env.AUTH_EMAIL_FROM, to: [email], subject: 'Sign in to Aksara', text: `Open this link to sign in to Aksara:\n\n${url}\n\nIf you did not request this email, ignore it.` })
    });
    if (!response.ok) throw new Error('Sign-in email delivery failed');
   }
  }), sveltekitCookies(getRequestEvent)]
 });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() { return instance ??= createAuth(); }
