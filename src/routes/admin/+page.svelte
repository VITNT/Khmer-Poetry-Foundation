<script lang="ts">
 import { enhance } from '$app/forms';
 import { useLanguage } from '$lib/i18n.svelte';
 const language = useLanguage();
 let { data, form } = $props();
 let busy = $state(false);
</script>
<svelte:head><title>{language.t('Review poems', 'ពិនិត្យកំណាព្យ')} — Aksara</title></svelte:head>
<section class="page-width account-page editor-page">
 <div class="landing-intro"><h1>{language.t('Review poems', 'ពិនិត្យកំណាព្យ')}</h1><p>{language.number(data.pendingCount)} {language.t('waiting for review. Read both versions before publishing.', 'កំពុងរង់ចាំពិនិត្យ។ សូមអានទាំងពីរភាសាមុនបោះពុម្ព។')}</p></div>
 {#if data.reviewed}<p class="form-notice" role="status">{language.t('Review saved.', 'បានរក្សាទុកការពិនិត្យ។')}</p>{/if}
 {#if form?.message}<p class="form-notice error" role="alert">{form.message}</p>{/if}
 {#if data.poem}
  <article class="review-poem"><span class="status-badge">{language.theme(data.poem.theme)}</span><h2>{data.poem.title}</h2><p class="khmer" lang="km">{data.poem.khmer}</p><p>{language.t('By', 'ដោយ')} {data.poem.author}{data.poem.authorKhmer ? ` · ${data.poem.authorKhmer}` : ''}</p><p>{data.poem.description}</p>
   {#if data.poem.khmerLines.length}<h3>{language.t('Khmer text', 'អត្ថបទខ្មែរ')}</h3><div class="review-text khmer" lang="km">{data.poem.khmerLines.join('\n')}</div>{/if}
   {#if data.poem.lines.length}<h3>{language.t('English text', 'អត្ថបទអង់គ្លេស')}</h3><div class="review-text" lang="en">{data.poem.lines.join('\n')}</div>{/if}
  </article>
  <form method="POST" class="form-actions" use:enhance={() => { busy = true; return async ({ update }) => { await update(); busy = false; }; }}><input type="hidden" name="id" value={data.poem.id} /><input type="hidden" name="updatedAt" value={data.poem.updatedAt} /><button name="decision" value="return" class="plain-button" disabled={busy}>{language.t('Return for revision', 'បញ្ជូនត្រឡប់ឱ្យកែសម្រួល')}</button><button name="decision" value="approve" class="primary-button" disabled={busy}>{language.t('Approve & publish', 'អនុម័ត និងបោះពុម្ព')}</button></form>
 {:else}<div class="empty-state"><h2>{language.t('All caught up.', 'បានពិនិត្យគ្រប់កំណាព្យហើយ។')}</h2><p>{language.t('New submissions will appear here.', 'កំណាព្យដែលដាក់ស្នើថ្មីនឹងបង្ហាញនៅទីនេះ។')}</p></div>{/if}
</section>
