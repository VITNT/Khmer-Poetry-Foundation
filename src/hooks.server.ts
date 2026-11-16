import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { getSessionCookie } from 'better-auth/cookies';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { getAuth } from '$lib/server/better-auth';
import { createDatabase, getPool } from '$lib/server/database';
export const handle: Handle = async ({ event, resolve }) => {
 const auth = getAuth();
 const pool = getPool();
 event.locals.user = null;
 event.locals.isAdmin = false;
 if (auth && !building && getSessionCookie(event.request)) {
  const session = await auth.api.getSession({ headers: event.request.headers });
  event.locals.user = session?.user ?? null;
 }
 event.locals.db = pool ? createDatabase(pool, event.locals.user?.id ?? null) : null;
 if (event.locals.user && event.locals.db) {
  const result = await event.locals.db.query('select public.is_admin() as value');
  event.locals.isAdmin = result.rows[0]?.value === true;
 }
 const render: typeof resolve = (event) => resolve(event, {
  transformPageChunk: ({ html }) => html.replace('<html lang="en">', `<html lang="${event.cookies.get('aksara-language') === 'km' ? 'km' : 'en'}">`)
 });
 const response = auth ? await svelteKitHandler({ event, resolve: render, auth, building }) : await render(event);
 response.headers.set('cache-control', 'private, no-store');
 return response;
};
