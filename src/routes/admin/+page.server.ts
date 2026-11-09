import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import { databaseError, toSubmission } from '$lib/server/poems';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async event => {
 const { db } = requireAdmin(event);
 // Review one complete poem at a time; avoid downloading an entire queue of bodies.
 const { data, count, error } = await db.from('poems').select('*', { count: 'exact' }).eq('status', 'pending').order('created_at').order('id').limit(1);
 if (error) databaseError(error);
 return { poem: data?.[0] ? toSubmission(data[0]) : null, pendingCount: count || 0, reviewed: event.url.searchParams.has('reviewed') };
};
export const actions: Actions = {
 default: async event => {
  const { db } = requireAdmin(event);
  const form = await event.request.formData();
  const id = String(form.get('id') || '');
  const status = form.get('decision') === 'approve' ? 'published' : form.get('decision') === 'return' ? 'rejected' : null;
  const updatedAt = String(form.get('updatedAt') || '');
  if (!status || !/^[0-9a-f-]{36}$/.test(id) || !Number.isFinite(Date.parse(updatedAt))) return fail(400, { message: 'Invalid review. Reload the queue and try again.' });
  const { data, error } = await db.from('poems').update({ status }).eq('id', id).eq('status', 'pending').eq('updated_at', updatedAt).select('id').maybeSingle();
  if (error) return fail(400, { message: 'The review could not be saved. Please try again.' });
  if (!data) return fail(409, { message: 'This submission changed or was already reviewed. Reload before reviewing it.' });
  redirect(303, '/admin?reviewed=1');
 }
};
