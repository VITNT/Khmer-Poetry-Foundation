import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import { databaseError, toSubmission } from '$lib/server/poems';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async event => {
 const { db } = requireAdmin(event);
 // Review one complete poem at a time; avoid downloading an entire queue of bodies.
 try {
  const result = await db.query("select * from poems where status = 'pending' order by created_at, id limit 1");
  const count = await db.query("select count(*)::int as total from poems where status = 'pending'");
  return { poem: result.rows[0] ? toSubmission(result.rows[0]) : null, pendingCount: count.rows[0].total, reviewed: event.url.searchParams.has('reviewed') };
 } catch (cause) { databaseError(cause as Error); }
};
export const actions: Actions = {
 default: async event => {
  const { db } = requireAdmin(event);
  const form = await event.request.formData();
  const id = String(form.get('id') || '');
  const status = form.get('decision') === 'approve' ? 'published' : form.get('decision') === 'return' ? 'rejected' : null;
  const updatedAt = String(form.get('updatedAt') || '');
  if (!status || !/^[0-9a-f-]{36}$/.test(id) || !Number.isFinite(Date.parse(updatedAt))) return fail(400, { message: 'Invalid review. Reload the queue and try again.' });
  let result;
  try {
   result = await db.query("update poems set status = $1 where id::text = $2 and status = 'pending' and updated_at = $3::timestamptz returning id", [status, id, updatedAt]);
  } catch { return fail(400, { message: 'The review could not be saved. Please try again.' }); }
  if (!result.rows[0]) return fail(409, { message: 'This submission changed or was already reviewed. Reload before reviewing it.' });
  redirect(303, '/admin?reviewed=1');
 }
};
