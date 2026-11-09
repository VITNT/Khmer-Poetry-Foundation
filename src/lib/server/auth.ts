import { error, redirect, type RequestEvent } from '@sveltejs/kit';
export function requireUser(event: RequestEvent) {
 if (!event.locals.supabase) error(503, 'Poem submissions are not connected yet.');
 if (!event.locals.user) redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
 return { db: event.locals.supabase, user: event.locals.user };
}
export function requireAdmin(event: RequestEvent) {
 const session = requireUser(event);
 if (!event.locals.isAdmin) error(403, 'Only editors can access the review queue.');
 return session;
}
