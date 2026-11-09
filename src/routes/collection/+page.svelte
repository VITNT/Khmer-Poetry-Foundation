<script lang="ts">
 import { page } from '$app/state';
 import { useLanguage } from '$lib/i18n.svelte';
 import PoemIndex from '$lib/PoemIndex.svelte';
 const language = useLanguage();
 let { data } = $props();
 let savedOnly = $derived(page.url.searchParams.has('saved'));
 let title = $derived(savedOnly ? language.t('Reading list', 'បញ្ជីអាន') : language.t('All poems', 'កំណាព្យទាំងអស់'));
</script>
<svelte:head><title>{title} — {language.t('Aksara', 'អក្សរ')}</title></svelte:head>
<div class="page-width archive-page">
 <section class="landing-intro"><h1>{title}</h1><p>{savedOnly ? language.t('Your saved poems, stored on this device.', 'កំណាព្យដែលអ្នកបានរក្សាទុកលើឧបករណ៍នេះ។') : language.t('Browse the collection in Khmer and English.', 'មើលបណ្ដុំកំណាព្យជាភាសាខ្មែរ និងអង់គ្លេស។')}</p></section>
 <PoemIndex {savedOnly} result={data.result} stats={data.stats} options={data.options} />
 {#if !savedOnly}<p class="sample-note">{language.number(data.stats.sourcedCount)} {language.t('sourced works', 'ស្នាដៃមានប្រភព')} · {language.number(data.stats.sampleCount)} {language.t('original sample poems', 'កំណាព្យគំរូ')} · {language.number(data.stats.communityCount)} {language.t('community poems', 'កំណាព្យពីសហគមន៍')}</p>{/if}
</div>
