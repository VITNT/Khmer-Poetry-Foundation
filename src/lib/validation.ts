import { submissionThemes } from './catalog';

export const maxPoemLength = 50000;
export function validatePoem(form: FormData) {
 const value = (name: string) => typeof form.get(name) === 'string' ? String(form.get(name)).replace(/\r\n?/g, '\n').normalize('NFC').trim() : '';
 const values = { title: value('title'), khmer: value('khmer'), author: value('author'), authorKhmer: value('authorKhmer'), theme: value('theme'), description: value('description'), englishText: value('englishText'), khmerText: value('khmerText'), permission: value('permission') };
 let message = '';
 if (!values.title && !values.khmer) message = 'Add a title in Khmer or English.';
 else if (values.title.length > 200 || values.khmer.length > 200) message = 'Titles must be 200 characters or fewer.';
 else if (!values.author || values.author.length > 120 || values.authorKhmer.length > 120) message = 'Add an author name of 120 characters or fewer.';
 else if (!submissionThemes.includes(values.theme)) message = 'Choose a theme from the list.';
 else if (values.description.length > 1000) message = 'The introduction must be 1,000 characters or fewer.';
 else if (!values.englishText && !values.khmerText) message = 'Add your poem in Khmer or English.';
 else if (values.englishText.length + values.khmerText.length > maxPoemLength) message = 'The combined poem text must be 50,000 characters or fewer.';
 else if (values.permission !== 'yes') message = 'Confirm that you wrote this poem or have permission to share it.';
 return { values, message };
}
export function safeNext(value: string | null) {
 return value && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value) ? value : '/account';
}
