import { requireUser } from '$lib/server/auth';
import { saveSubmission } from '$lib/server/submissions';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = event => { requireUser(event); return { poem: null }; };
export const actions: Actions = {
 save: event => saveSubmission(event, 'draft'),
 submit: event => saveSubmission(event, 'pending')
};
