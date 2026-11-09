import { env } from '$env/dynamic/public';
import { createServerClient } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';

const supabaseConfigured = () => Boolean(env.PUBLIC_SUPABASE_URL && env.PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export function createSupabase(event: RequestEvent) {
 if (!supabaseConfigured()) return null;
 return createServerClient(env.PUBLIC_SUPABASE_URL!, env.PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
  global: { fetch: event.fetch },
  cookies: {
   getAll: () => event.cookies.getAll(),
   setAll: cookies => { for (const { name, value, options } of cookies) event.cookies.set(name, value, { ...options, path: '/' }); }
  }
 });
}
