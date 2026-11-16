import { requireUser } from '$lib/server/auth';
import { databaseError, summaryColumns, toSummary } from '$lib/server/poems';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async event => {
 const { db, user } = requireUser(event);
 const requestedPage = Number(event.url.searchParams.get('page'));
 const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1;
 try {
  const result = await db.query(`select ${summaryColumns},id,status from poems where owner_id = $1 order by created_at desc, id limit 20 offset $2`, [user.id, (page - 1) * 20]);
  const count = await db.query('select count(*)::int as total from poems where owner_id = $1', [user.id]);
  return { submissions: result.rows.map(p => ({ ...toSummary(p), id: p.id, status: p.status })), page, pageCount: Math.max(1, Math.ceil(count.rows[0].total / 20)), saved: event.url.searchParams.has('saved') };
 } catch (cause) { databaseError(cause as Error); }
};
