import { loadSubmission, saveSubmission } from '$lib/server/submissions';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async event => ({ poem: await loadSubmission(event) });
export const actions: Actions = {
 save: event => saveSubmission(event, 'draft', true),
 submit: event => saveSubmission(event, 'pending', true)
};
