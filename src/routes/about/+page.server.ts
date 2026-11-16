import { collectionStats } from '$lib/server/poems';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals }) => ({ stats: await collectionStats(locals.db) });
