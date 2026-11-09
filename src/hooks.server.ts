import type { Handle } from '@sveltejs/kit';
import { createSupabase } from '$lib/server/supabase';
export const handle: Handle = async ({ event, resolve }) => {
 event.locals.supabase = createSupabase(event);
 event.locals.user = null;
 event.locals.isAdmin = false;
 // getUser validates the token with Supabase; cookie contents alone are not trusted.
 if (event.locals.supabase && event.cookies.getAll().some(cookie => cookie.name.startsWith('sb-'))) {
  const { data, error } = await event.locals.supabase.auth.getUser();
  if (!error && data.user) {
   event.locals.user = data.user;
   const { data: isAdmin, error: adminError } = await event.locals.supabase.rpc('is_admin');
   event.locals.isAdmin = !adminError && isAdmin === true;
  }
 }
 const response = await resolve(event, {
  filterSerializedResponseHeaders: name => name === 'content-range' || name === 'x-supabase-api-version',
  transformPageChunk: ({ html }) => html.replace('<html lang="en">', `<html lang="${event.cookies.get('aksara-language') === 'km' ? 'km' : 'en'}">`)
 });
 // HTML and load responses contain account state and may refresh auth cookies.
 if (event.route.id) response.headers.set('cache-control', 'private, no-store');
 return response;
};
