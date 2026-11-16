import { json } from '@sveltejs/kit';
import { collectionOptions } from '$lib/catalog';
import { collectionStats, listPoems } from '$lib/server/poems';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ locals, url, cookies }) => {
 const options = collectionOptions(url.searchParams, cookies.get('aksara-language') || 'en');
 const [result, stats] = await Promise.all([url.searchParams.has('saved') ? { poems: [], total: 0, page: 1, pageCount: 1 } : listPoems(locals.db, options), collectionStats(locals.db)]);
 return json({ result, stats });
};
