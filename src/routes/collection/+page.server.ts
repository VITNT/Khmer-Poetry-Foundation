import { collectionOptions } from '$lib/catalog';
import { listPoems, collectionStats } from '$lib/server/poems';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals, url, cookies }) => {
 const options = collectionOptions(url.searchParams, cookies.get('aksara-language') || 'en');
 const [result, stats] = await Promise.all([
  url.searchParams.has('saved') ? { poems: [], total: 0, page: 1, pageCount: 1 } : listPoems(locals.supabase, options),
  collectionStats(locals.supabase)
 ]);
 return { result, stats, options };
};
