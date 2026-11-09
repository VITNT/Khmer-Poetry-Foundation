import { requireUser } from '$lib/server/auth';
import { databaseError, summaryColumns, toSummary } from '$lib/server/poems';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async event => {
 const { db, user } = requireUser(event);
 const requestedPage = Number(event.url.searchParams.get('page'));
 const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1;
 const { data, count, error } = await db.from('poems').select(`${summaryColumns},id,status,updated_at`, { count: 'exact' }).eq('owner_id', user.id).order('created_at', { ascending: false }).order('id').range((page - 1) * 20, page * 20 - 1);
 if (error) databaseError(error);
 return { submissions: (data || []).map(p => ({ ...toSummary(p), id: p.id, status: p.status })), page, pageCount: Math.max(1, Math.ceil((count || 0) / 20)), saved: event.url.searchParams.has('saved') };
};
