import { error, json } from '@sveltejs/kit';
import { collectionOptions } from '$lib/catalog';
import { listPoems } from '$lib/server/poems';
import type { RequestHandler } from './$types';
export const POST: RequestHandler = async ({ request, locals, url, cookies }) => {
 if (!request.headers.get('content-type')?.startsWith('application/json')) error(415, 'Expected JSON.');
 const text = await request.text();
 if (text.length > 70000) error(413, 'Reading list is too large.');
 let slugs: unknown;
 try { slugs = JSON.parse(text).slugs; } catch { error(400, 'Invalid reading list.'); }
 if (!Array.isArray(slugs) || slugs.length > 500 || !slugs.every(s => typeof s === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(s))) error(400, 'Invalid reading list.');
 const result = await listPoems(locals.supabase, { ...collectionOptions(url.searchParams, cookies.get('aksara-language') || 'en'), slugs: [...new Set(slugs)] });
 return json(result, { headers: { 'cache-control': 'private, no-store' } });
};
