import { getAuth } from '$lib/server/better-auth';
import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';
import { safeNext } from '$lib/validation';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = ({ locals, url }) => {
 if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
 return { next: safeNext(url.searchParams.get('next')), callbackError: url.searchParams.has('error') };
};
export const actions: Actions = {
 default: async ({ locals, request, url }) => {
  const auth = getAuth();
  if (!locals.db || !auth || !env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM) return fail(503, { message: 'Sign-in is not connected yet.', email: '', sent: false });
  const form = await request.formData();
  const email = String(form.get('email') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return fail(400, { message: 'Enter a valid email address.', email, sent: false });
  const callback = new URL('/auth/callback', env.BETTER_AUTH_URL);
  callback.searchParams.set('next', safeNext(form.get('next')?.toString() || null));
  try {
   await auth.api.signInMagicLink({ headers: request.headers, body: { email, callbackURL: callback.toString(), errorCallbackURL: new URL('/login?error=link', env.BETTER_AUTH_URL).toString() } });
  } catch { return fail(400, { message: 'We could not send a sign-in link. Please try again later or contact the site owner.', email, sent: false }); }
  return { sent: true, email, message: 'Check your email and open the sign-in link in this browser. It also creates your account if you’re new.' };
 }
};
