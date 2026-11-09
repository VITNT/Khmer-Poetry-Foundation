import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
export const POST: RequestHandler = async ({ locals, request, url }) => {
 if (request.headers.get('origin') !== url.origin) error(403, 'Invalid request origin.');
 if (locals.supabase) {
  const result = await locals.supabase.auth.signOut();
  if (result.error) error(503, 'Could not sign out. Please try again.');
 }
 redirect(303, '/');
};
