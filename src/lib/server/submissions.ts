import { error, fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { requireUser } from './auth';
import { validatePoem } from '$lib/validation';
import { databaseError, toSubmission } from './poems';

export async function loadSubmission(event: RequestEvent) {
 const { db, user } = requireUser(event);
 const { data, error: cause } = await db.from('poems').select('*').eq('id', event.params.id || '').eq('owner_id', user.id).maybeSingle();
 if (cause) databaseError(cause);
 if (!data) error(404, 'This submission could not be found.');
 return toSubmission(data);
}
export async function saveSubmission(event: RequestEvent, status: 'draft' | 'pending', editing = false) {
 const { db, user } = requireUser(event);
 const form = await event.request.formData();
 const { values, message } = validatePoem(form);
 if (message) return fail(400, { message, values });
 const row = {
  title: values.title || values.khmer,
  khmer: values.khmer || values.title,
  author: values.author,
  author_khmer: values.authorKhmer,
  theme: values.theme,
  description: values.description,
  lines: values.englishText ? values.englishText.split('\n') : [],
  khmer_lines: values.khmerText ? values.khmerText.split('\n') : [],
  status
 };
 let result;
 if (editing) {
  const updatedAt = String(form.get('updatedAt') || '');
  if (!updatedAt || !Number.isFinite(Date.parse(updatedAt))) return fail(400, { message: 'Reload this draft before saving.', values });
  result = await db.from('poems').update(row).eq('id', event.params.id || '').eq('owner_id', user.id).in('status', ['draft', 'rejected']).eq('updated_at', updatedAt).select('id').maybeSingle();
 } else {
  const prefix = (values.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'poem';
  result = await db.from('poems').insert({ ...row, owner_id: user.id, slug: `${prefix}-${crypto.randomUUID()}` }).select('id').single();
 }
 if (result.error) {
  const message = result.error.code === 'P0001' ? 'You can create up to 10 poems per day. Please try again tomorrow.' : 'Your poem could not be saved. Please try again.';
  console.error('Submission save failed:', result.error.message);
  return fail(result.error.code === 'P0001' ? 429 : 400, { message, values });
 }
 if (!result.data) return fail(409, { message: 'This poem changed or is already under review. Reload the page before continuing.', values });
 redirect(303, '/account?saved=1');
}
