<script lang="ts">
 import { enhance } from '$app/forms';
 import type { Submission } from '$lib/content';
 import type { validatePoem } from '$lib/validation';
 import { submissionThemes } from '$lib/catalog';
 import { useLanguage } from '$lib/i18n.svelte';
 const language = useLanguage();
 let { poem, form }: { poem: Submission | null; form: { message: string; values: ReturnType<typeof validatePoem>['values'] } | null } = $props();
 let busy = $state(false);
 let editable = $derived(!poem || poem.status === 'draft' || poem.status === 'rejected');
 let values = $derived(form?.values || {
  title: poem?.title || '', khmer: poem?.khmer || '', author: poem?.author || '', authorKhmer: poem?.authorKhmer || '', theme: poem?.theme || 'Memory', description: poem?.description || '', englishText: poem?.lines.join('\n') || '', khmerText: poem?.khmerLines.join('\n') || '', permission: ''
 });
</script>
<svelte:head><title>{language.t(poem ? 'Your poem' : 'Write a poem', poem ? 'កំណាព្យរបស់អ្នក' : 'សរសេរកំណាព្យ')} — Aksara</title></svelte:head>
<section class="page-width account-page editor-page">
 <a class="back-link" href="/account">{language.t('← My poems', '← កំណាព្យរបស់ខ្ញុំ')}</a>
 <div class="landing-intro"><h1>{language.t(poem ? 'Your poem' : 'Write a poem', poem ? 'កំណាព្យរបស់អ្នក' : 'សរសេរកំណាព្យ')}</h1><p>{language.t('Write in Khmer, English, or both. Keep blank lines between stanzas.', 'សរសេរជាភាសាខ្មែរ អង់គ្លេស ឬទាំងពីរ។ ទុកបន្ទាត់ទទេរវាងវគ្គ។')}</p></div>
 {#if poem?.status === 'pending'}<p class="form-notice" role="status">{language.t('Your poem is waiting for editorial review. It will appear in the collection after approval.', 'កំណាព្យរបស់អ្នកកំពុងរង់ចាំការពិនិត្យ។ វានឹងបង្ហាញក្នុងបណ្ដុំបន្ទាប់ពីបានអនុម័ត។')}</p>{/if}
 {#if poem?.status === 'rejected'}<p class="form-notice" role="status">{language.t('The editor returned this poem for revision. You can edit it and submit again.', 'អ្នកកែសម្រួលបានបញ្ជូនកំណាព្យនេះត្រឡប់មកវិញ។ អ្នកអាចកែសម្រួល ហើយដាក់ស្នើម្ដងទៀត។')}</p>{/if}
 {#if form?.message}<p class="form-notice error" role="alert">{form.message}</p>{/if}
 <form method="POST" action="?/save" class="editor-form" use:enhance={() => { busy = true; return async ({ update }) => { await update({ reset: false }); busy = false; }; }}>
  <input type="hidden" name="updatedAt" value={poem?.updatedAt || ''} />
  <fieldset disabled={!editable || busy}>
   <div class="field-grid"><label>{language.t('English title', 'ចំណងជើងអង់គ្លេស')}<input name="title" maxlength="200" value={values.title} /></label><label>{language.t('Khmer title', 'ចំណងជើងខ្មែរ')}<input name="khmer" lang="km" maxlength="200" value={values.khmer} /></label></div>
   <p class="field-hint">{language.t('Add a title in at least one language.', 'បញ្ចូលចំណងជើងយ៉ាងហោចណាស់មួយភាសា។')}</p>
   <div class="field-grid"><label>{language.t('Author / pen name', 'ឈ្មោះអ្នកនិពន្ធ / នាមប៉ាកកា')}<input name="author" required maxlength="120" autocomplete="nickname" value={values.author} /></label><label>{language.t('Author name in Khmer (optional)', 'ឈ្មោះអ្នកនិពន្ធជាខ្មែរ (ស្រេចចិត្ត)')}<input name="authorKhmer" lang="km" maxlength="120" value={values.authorKhmer} /></label></div>
   <label>{language.t('Theme', 'ប្រធានបទ')}<select name="theme" value={values.theme}>{#each submissionThemes as theme}<option value={theme}>{language.theme(theme)}</option>{/each}</select></label>
   <label>{language.t('Short introduction (optional)', 'សេចក្ដីណែនាំខ្លី (ស្រេចចិត្ត)')}<textarea name="description" rows="3" maxlength="1000">{values.description}</textarea></label>
   <label>{language.t('Khmer poem', 'កំណាព្យខ្មែរ')}<textarea class="poem-input khmer" name="khmerText" lang="km" rows="14" maxlength="50000">{values.khmerText}</textarea></label>
   <label>{language.t('English poem', 'កំណាព្យអង់គ្លេស')}<textarea class="poem-input" name="englishText" lang="en" rows="14" maxlength="50000">{values.englishText}</textarea></label>
   <p class="field-hint">{language.t('Add the poem in at least one language. Up to 50,000 characters combined.', 'បញ្ចូលកំណាព្យយ៉ាងហោចណាស់មួយភាសា។ សរុបមិនលើស ៥០,០០០ តួអក្សរ។')}</p>
   {#if editable}
    <label class="checkbox-field"><input type="checkbox" name="permission" value="yes" required checked={values.permission === 'yes'} /><span>{language.t('I wrote this poem or have permission to share it publicly on Aksara.', 'ខ្ញុំបានសរសេរកំណាព្យនេះ ឬមានការអនុញ្ញាតឱ្យចែករំលែកជាសាធារណៈនៅលើអក្សរ។')}</span></label>
    <p class="field-hint">{language.t('An editor reviews submissions before publication. You can create up to 10 poems per day.', 'អ្នកកែសម្រួលនឹងពិនិត្យមុនបោះពុម្ព។ អ្នកអាចបង្កើតកំណាព្យរហូតដល់ ១០ ក្នុងមួយថ្ងៃ។')}</p>
    <div class="form-actions"><button class="plain-button" formaction="?/save">{language.t('Save draft', 'រក្សាទុកសេចក្ដីព្រាង')}</button><button class="primary-button" formaction="?/submit">{busy ? language.t('Saving…', 'កំពុងរក្សាទុក…') : language.t('Submit for review', 'ដាក់ស្នើសម្រាប់ពិនិត្យ')}</button></div>
   {/if}
  </fieldset>
 </form>
</section>
