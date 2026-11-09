<script lang="ts">
 import { page } from '$app/state';
 import { useLanguage } from '$lib/i18n.svelte';
 const language = useLanguage();
</script>
<svelte:head><title>{page.status} — {language.t('Aksara', 'អក្សរ')}</title></svelte:head>
<section class="page-width empty-state"><div class="eyebrow">{language.number(page.status)}</div><h1>{language.t('A page yet to be written.', 'ទំព័រនេះមិនទាន់មានទេ។')}</h1><p>{language.khmer ? (page.status === 404 ? 'រកមិនឃើញទំព័រដែលអ្នកស្វែងរក។' : 'មានបញ្ហាកើតឡើង។ សូមសាកល្បងម្ដងទៀត។') : page.error?.message || 'Something went wrong.'}</p><a class="primary-button" href="/collection">{language.t('Return to the collection ↗', 'ត្រឡប់ទៅបណ្ដុំកំណាព្យ ↗')}</a></section>
