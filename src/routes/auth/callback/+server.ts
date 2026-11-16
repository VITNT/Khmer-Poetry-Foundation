import { redirect } from '@sveltejs/kit';
import { safeNext } from '$lib/validation';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ locals, url }) => {
 if (!locals.user || url.searchParams.has('error')) redirect(303, '/login?error=link');
 redirect(303, safeNext(url.searchParams.get('next')));
};
