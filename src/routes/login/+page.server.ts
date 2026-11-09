import { fail, redirect } from '@sveltejs/kit';
import { safeNext } from '$lib/validation';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = ({ locals, url }) => {
 if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
 return { next: safeNext(url.searchParams.get('next')), callbackError: url.searchParams.has('error') };
};
export const actions: Actions = {
 default: async ({ locals, request, url }) => {
  if (!locals.supabase) return fail(503, { message: 'Sign-in is not connected yet.', email: '', sent: false });
  const form = await request.formData();
  const email = String(form.get('email') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return fail(400, { message: 'Enter a valid email address.', email, sent: false });
  const callback = new URL('/auth/callback', url.origin);
  callback.searchParams.set('next', safeNext(form.get('next')?.toString() || null));
  const { error } = await locals.supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callback.toString() } });
  if (error) return fail(400, { message: 'We could not send a sign-in link. Please try again later or contact the site owner.', email, sent: false });
  return { sent: true, email, message: 'Check your email and open the sign-in link in this browser. It also creates your account if you’re new.' };
 }
};
