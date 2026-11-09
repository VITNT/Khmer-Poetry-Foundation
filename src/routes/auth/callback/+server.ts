import { redirect } from '@sveltejs/kit';
import { safeNext } from '$lib/validation';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ locals, url }) => {
 const code = url.searchParams.get('code');
 const tokenHash = url.searchParams.get('token_hash');
 if (locals.supabase) {
  const result = code
   ? await locals.supabase.auth.exchangeCodeForSession(code)
   : tokenHash && url.searchParams.get('type') === 'email'
    ? await locals.supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' }) : null;
  if (result && !result.error) redirect(303, safeNext(url.searchParams.get('next')));
 }
 redirect(303, '/login?error=link');
};
