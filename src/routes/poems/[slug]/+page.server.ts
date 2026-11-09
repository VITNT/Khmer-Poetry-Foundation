import { poemBySlug } from '$lib/server/poems';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = ({ locals, params }) => poemBySlug(locals.supabase, params.slug);
