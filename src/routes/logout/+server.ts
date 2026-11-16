import { error, redirect } from '@sveltejs/kit';
import { getAuth } from '$lib/server/better-auth';
import type { RequestHandler } from './$types';
export const POST: RequestHandler = async ({ request, url }) => {
 if (request.headers.get('origin') !== url.origin) error(403, 'Invalid request origin.');
 const auth = getAuth();
 if (auth) {
  try { await auth.api.signOut({ headers: request.headers }); }
  catch { error(503, 'Could not sign out. Please try again.'); }
 }
 redirect(303, '/');
};
