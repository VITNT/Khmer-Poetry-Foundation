<script lang="ts">
 import { useLanguage } from '$lib/i18n.svelte';
 const language = useLanguage();
 let { data } = $props();
 const statuses: Record<string, string> = { draft: 'សេចក្ដីព្រាង', pending: 'កំពុងរង់ចាំពិនិត្យ', published: 'បានបោះពុម្ព', rejected: 'ត្រូវកែសម្រួល' };
</script>
<svelte:head><title>{language.t('My poems', 'កំណាព្យរបស់ខ្ញុំ')} — Aksara</title></svelte:head>
<section class="page-width account-page">
 <div class="account-heading"><div class="landing-intro"><h1>{language.t('My poems', 'កំណាព្យរបស់ខ្ញុំ')}</h1><p>{data.user?.email}</p></div><a class="primary-button" href="/submit">{language.t('Write a poem', 'សរសេរកំណាព្យ')}</a></div>
 {#if data.saved}<p class="form-notice" role="status">{language.t('Your poem has been saved.', 'កំណាព្យរបស់អ្នកត្រូវបានរក្សាទុក។')}</p>{/if}
 {#if data.submissions.length}
  <div class="submission-list">{#each data.submissions as poem}<article><div><h2><a href={poem.status === 'published' ? `/poems/${poem.slug}` : `/submit/${poem.id}`}>{language.title(poem)}</a></h2><p>{language.theme(poem.theme)}</p></div><span class="status-badge">{language.t(poem.status, statuses[poem.status] || poem.status)}</span><a class="text-link" href={poem.status === 'published' ? `/poems/${poem.slug}` : `/submit/${poem.id}`}>{language.t(poem.status === 'draft' || poem.status === 'rejected' ? 'Edit →' : 'Read →', poem.status === 'draft' || poem.status === 'rejected' ? 'កែសម្រួល →' : 'អាន →')}</a></article>{/each}</div>
 {:else}<div class="empty-state"><h2>{language.t('Your first poem starts here.', 'ចាប់ផ្ដើមកំណាព្យដំបូងរបស់អ្នកនៅទីនេះ។')}</h2><p>{language.t('Save a draft, then submit it when you’re ready. An editor reviews submissions before they appear in the collection.', 'រក្សាទុកសេចក្ដីព្រាង រួចដាក់ស្នើនៅពេលរួចរាល់។ អ្នកកែសម្រួលនឹងពិនិត្យមុនបោះពុម្ពក្នុងបណ្ដុំ។')}</p></div>{/if}
 {#if data.pageCount > 1}<nav class="pagination" aria-label="My poem pages">{#if data.page > 1}<a href={`?page=${data.page - 1}`}>← {language.t('Previous', 'មុន')}</a>{/if}<span>{data.page} / {data.pageCount}</span>{#if data.page < data.pageCount}<a href={`?page=${data.page + 1}`}>{language.t('Next', 'បន្ទាប់')} →</a>{/if}</nav>{/if}
 <form method="POST" action="/logout" class="signout-form"><button class="plain-button">{language.t('Sign out', 'ចាកចេញពីគណនី')}</button></form>
</section>
