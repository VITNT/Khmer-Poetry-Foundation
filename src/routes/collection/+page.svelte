<script lang="ts">
 import { page } from '$app/state';
 import { useLanguage } from '$lib/i18n.svelte';
 import { bundledCollection, bundledStats } from '$lib/bundled-collection';
 import LoadingIndicator from '$lib/LoadingIndicator.svelte';
 import type { CollectionResult, CollectionStats } from '$lib/content';
 import PoemIndex from '$lib/PoemIndex.svelte';
 const language = useLanguage();
 let { data } = $props();
 let live = $state<{ result: CollectionResult; stats: CollectionStats } | null>(null);
 let loading = $state(false);
 let failed = $state(false);
 let retry = $state(0);
 let result = $derived(live?.result ?? data.result ?? bundledCollection(data.options));
 let stats = $derived(live?.stats ?? data.stats ?? bundledStats);
 $effect(() => {
  const refresh = data.refreshCollection;
  const search = page.url.search;
  const saved = savedOnly;
  void data.options;
  void retry;
  live = null;
  failed = false;
  loading = refresh && !saved;
  if (!refresh) return;
  const controller = new AbortController();
  fetch(`/collection/data${search}`, { signal: controller.signal })
   .then(async response => {
    if (!response.ok) throw new Error('Collection unavailable');
    const value = await response.json();
    if (!controller.signal.aborted) live = value;
   })
   .catch(() => { if (!controller.signal.aborted) failed = true; })
   .finally(() => { if (!controller.signal.aborted) loading = false; });
  return () => controller.abort();
 });
 let savedOnly = $derived(page.url.searchParams.has('saved'));
 let title = $derived(savedOnly ? language.t('Reading list', 'បញ្ជីអាន') : language.t('All poems', 'កំណាព្យទាំងអស់'));
</script>
<svelte:head><title>{title} — {language.t('Aksara', 'អក្សរ')}</title></svelte:head>
<div class="page-width archive-page">
 <section class="landing-intro"><h1>{title}</h1><p>{savedOnly ? language.t('Your saved poems, stored on this device.', 'កំណាព្យដែលអ្នកបានរក្សាទុកលើឧបករណ៍នេះ។') : language.t('Browse the collection in Khmer and English.', 'មើលបណ្ដុំកំណាព្យជាភាសាខ្មែរ និងអង់គ្លេស។')}</p></section>
 {#if !savedOnly && data.refreshCollection && !live}
  {#if failed}<p class="form-notice error" role="alert">{language.t('The full collection could not load. Bundled poems are still available.', 'មិនអាចផ្ទុកបណ្ដុំទាំងមូលបានទេ។ កំណាព្យដែលមានស្រាប់នៅតែអាចអានបាន។')} <button class="plain-button" onclick={() => retry++}>{language.t('Retry', 'ព្យាយាមម្ដងទៀត')}</button></p>
  {:else}<LoadingIndicator label={language.t('Showing bundled poems. Loading the full collection…', 'កំពុងបង្ហាញកំណាព្យដែលមានស្រាប់។ កំពុងផ្ទុកបណ្ដុំទាំងមូល…')} />{/if}
 {/if}
 <PoemIndex {savedOnly} {result} {stats} options={data.options} pending={loading || (data.refreshCollection && !live && !failed && !savedOnly)} />
 {#if !savedOnly}<p class="sample-note">{language.number(stats.sourcedCount)} {language.t('sourced works', 'ស្នាដៃមានប្រភព')} · {language.number(stats.sampleCount)} {language.t('original sample poems', 'កំណាព្យគំរូ')} · {language.number(stats.communityCount)} {language.t('community poems', 'កំណាព្យពីសហគមន៍')}</p>{/if}
</div>
