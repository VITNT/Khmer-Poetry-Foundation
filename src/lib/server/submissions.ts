import { error, fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { requireUser } from './auth';
import { validatePoem } from '$lib/validation';
import { databaseError, toSubmission } from './poems';

export async function loadSubmission(event: RequestEvent) {
 const { db, user } = requireUser(event);
 let data;
 try {
  const result = await db.query('select * from poems where id::text = $1 and owner_id = $2', [event.params.id || '', user.id]);
  data = result.rows[0];
 } catch (cause) { databaseError(cause as Error); }
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
 try {
  const parameters = Object.values(row);
  if (editing) {
   const updatedAt = String(form.get('updatedAt') || '');
   if (!updatedAt || !Number.isFinite(Date.parse(updatedAt))) return fail(400, { message: 'Reload this draft before saving.', values });
   result = await db.query(`update poems set ${Object.keys(row).map((key, i) => `${key} = $${i + 1}`).join(', ')} where id::text = $10 and owner_id = $11 and status in ('draft', 'rejected') and updated_at = $12::timestamptz returning id`, [...parameters, event.params.id || '', user.id, updatedAt]);
  } else {
   const prefix = (row.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'poem';
   result = await db.query(`insert into poems (${Object.keys(row).join(',')},owner_id,slug) values (${parameters.map((_, i) => `$${i + 1}`).join(',')},$10,$11) returning id`, [...parameters, user.id, `${prefix}-${crypto.randomUUID()}`]);
  }
 } catch (cause) {
  const limited = (cause as { code?: string }).code === 'P0001';
  return fail(limited ? 429 : 400, { message: limited ? 'You can create up to 10 poems per day. Please try again tomorrow.' : 'Your poem could not be saved. Please try again.', values });
 }
 if (!result.rows[0]) return fail(409, { message: 'This poem changed or is already under review. Reload the page before continuing.', values });
 redirect(303, '/account?saved=1');
}
