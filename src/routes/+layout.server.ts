import type { LayoutServerLoad } from './$types';
import type { Locale } from '$lib/i18n.svelte';
export const load: LayoutServerLoad = ({ cookies, locals }) => ({
 locale: (cookies.get('aksara-language') === 'km' ? 'km' : 'en') as Locale,
 configured: Boolean(locals.db),
 user: locals.user ? { id: locals.user.id, email: locals.user.email } : null,
 isAdmin: locals.isAdmin
});
