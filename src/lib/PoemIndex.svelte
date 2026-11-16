<script lang="ts">
 import { useLanguage } from '$lib/i18n.svelte';
 import LoadingIndicator from './LoadingIndicator.svelte';
 import { page } from '$app/state';
 import { goto } from '$app/navigation';
 import { onDestroy } from 'svelte';
 import { readingList, toggleSaved } from '$lib/state.svelte';
 import type { CollectionResult, CollectionStats } from '$lib/content';
 import type { CollectionOptions } from '$lib/catalog';
 const language = useLanguage();
 let { savedOnly = false, pending = false, result, stats, options }: { savedOnly?: boolean; pending?: boolean; result: CollectionResult; stats: CollectionStats; options: CollectionOptions } = $props();
 let savedResult = $state<CollectionResult>({ poems: [], total: 0, page: 1, pageCount: 1 });
 let loading = $state(false);
 let loadError = $state('');
 let retry = $state(0);
 let themes = $derived(['All works', ...stats.themes]);
 let query = $derived(page.url.searchParams.get('q') || '');
 let theme = $derived(options.theme);
 let sort = $derived(options.sort);
 let collection = $derived(savedOnly ? savedResult : result);
 let visible = $derived(collection.poems);
 let pageCount = $derived(collection.pageCount);
 let currentPage = $derived(collection.page);
 let searchTimer: ReturnType<typeof setTimeout>;
 onDestroy(() => clearTimeout(searchTimer));
 $effect(() => {
  if (!savedOnly) return;
  const slugs = [...readingList.slugs];
  const search = page.url.search;
  // Locale and retry changes should refetch the saved results.
  void language.locale;
  void retry;
  const controller = new AbortController();
  loading = true;
  loadError = '';
  fetch(`/collection/saved${search}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slugs }), signal: controller.signal })
   .then(async response => {
    if (!response.ok) throw new Error(language.t('Could not load your reading list. Please try again.', 'មិនអាចបង្ហាញបញ្ជីអានបានទេ។ សូមព្យាយាមម្ដងទៀត។'));
    const data = await response.json();
    if (!controller.signal.aborted) savedResult = data;
   })
   .catch(cause => { if (!controller.signal.aborted) loadError = cause.message; })
   .finally(() => { if (!controller.signal.aborted) loading = false; });
  return () => controller.abort();
 });
 function update(key: string, value: string) {
  clearTimeout(searchTimer);
  const navigate = () => {
   const params = new URLSearchParams(page.url.searchParams);
   if (!value || (key === 'theme' && value === 'All works') || (key === 'sort' && value === 'asc')) params.delete(key);
   else params.set(key, value);
   if (key !== 'page') params.delete('page');
   void goto(`${page.url.pathname}${params.size ? '?' + params.toString() : ''}`, { replaceState: key === 'q', noScroll: true, keepFocus: true });
  };
  if (key === 'q') searchTimer = setTimeout(navigate, 250);
  else navigate();
 }
 function reset() { clearTimeout(searchTimer); void goto(`${page.url.pathname}${savedOnly ? '?saved=1' : ''}`, { noScroll: true }); }
</script>

<div class="poem-index">
 <div class="archive-tools">
  <label class="search-box">
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>
   <input type="search" value={query} oninput={event => update('q', event.currentTarget.value)} placeholder={language.t('Search poems in Khmer or English', 'ស្វែងរកកំណាព្យជាភាសាខ្មែរ ឬអង់គ្លេស')} aria-label={language.t('Search poems', 'ស្វែងរកកំណាព្យ')} />
  </label>
  <label class="sort-control">{language.t('Sort', 'តម្រៀប')} <select aria-label={language.t('Sort poems', 'តម្រៀបកំណាព្យ')} value={sort} onchange={event => update('sort', event.currentTarget.value)}><option value="asc">{language.t('Title A–Z', 'ចំណងជើង តាមលំដាប់អក្សរ')}</option><option value="desc">{language.t('Title Z–A', 'ចំណងជើង បញ្ច្រាសលំដាប់អក្សរ')}</option></select></label>
 </div>
 <div class="archive-filters">
  <div class="theme-filters" aria-label={language.t('Filter by theme', 'ជ្រើសរើសតាមប្រធានបទ')}>{#each themes as item}<button class:selected={theme === item} aria-pressed={theme === item} onclick={() => update('theme', item)}>{language.theme(item)}</button>{/each}</div>
  <span class="result-count" aria-live="polite">{language.number(collection.total)} {language.t(collection.total === 1 ? 'poem' : 'poems', 'កំណាព្យ')}</span>
 </div>
 {#if savedOnly && loading}<LoadingIndicator label={language.t('Loading your reading list…', 'កំពុងបង្ហាញបញ្ជីអាន…')} />
 {:else if loadError}<p class="form-notice error" role="alert">{loadError} <button class="plain-button" onclick={() => retry++}>{language.t('Retry', 'ព្យាយាមម្ដងទៀត')}</button></p>
 {:else if visible.length}
  <table class="poem-table">
   <caption class="sr-only">{savedOnly ? language.t('Saved poems', 'កំណាព្យដែលបានរក្សាទុក') : language.t('Poem collection', 'បណ្ដុំកំណាព្យ')} · {sort === 'asc' ? language.t('Title A–Z', 'តាមលំដាប់អក្សរ') : language.t('Title Z–A', 'បញ្ច្រាសលំដាប់អក្សរ')}</caption>
   <thead><tr><th scope="col" aria-sort={sort === 'asc' ? 'ascending' : 'descending'}>{language.t('Title', 'ចំណងជើង')}</th><th scope="col" class="author-column">{language.t('Author', 'អ្នកនិពន្ធ')}</th><th scope="col" class="year-column">{language.t('Year', 'ឆ្នាំ')}</th><th scope="col" class="theme-column">{language.t('Theme', 'ប្រធានបទ')}</th><th scope="col"><span class="sr-only">{language.t('Save poem', 'រក្សាទុកកំណាព្យ')}</span></th></tr></thead>
   <tbody>{#each visible as poem (poem.slug)}<tr>
    <td class="title-cell"><a href={`/poems/${poem.slug}`} class="poem-title"><span>{language.title(poem)}{#if poem.isExcerpt}<small class="excerpt-label">{language.t('Excerpt', 'ដកស្រង់')}</small>{/if}</span><span class="secondary-title" class:khmer={!language.khmer} lang={language.khmer ? 'en' : 'km'}>{language.khmer ? poem.title : poem.khmer}</span></a><span class="mobile-author">{language.author(poem)} <span>· {language.year(poem)} · {language.theme(poem.theme)}</span></span></td>
    <td class="author-column">{language.author(poem)}{#if poem.authorKhmer && !language.khmer}<span class="author-khmer khmer" lang="km">{poem.authorKhmer}</span>{/if}</td><td class="year-column">{language.year(poem)}</td><td class="theme-column">{language.theme(poem.theme)}</td>
    <td class="bookmark-cell"><button class="save-button" class:saved={readingList.slugs.includes(poem.slug)} onclick={() => toggleSaved(poem.slug)} aria-label={readingList.slugs.includes(poem.slug) ? language.t(`Remove ${poem.title} from reading list`, `ដក ${poem.khmer} ចេញពីបញ្ជីអាន`) : language.t(`Save ${poem.title}`, `រក្សាទុក ${poem.khmer}`)} aria-pressed={readingList.slugs.includes(poem.slug)}><svg viewBox="0 0 24 24" fill={readingList.slugs.includes(poem.slug) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg></button></td>
   </tr>{/each}</tbody>
  </table>
 {:else if !pending}
  <div class="empty-state"><h2>{savedOnly && !readingList.slugs.length ? language.t('No saved poems yet.', 'មិនទាន់មានកំណាព្យក្នុងបញ្ជីអាន។') : language.t('No poems found.', 'រកមិនឃើញកំណាព្យ។')}</h2><p>{savedOnly && !readingList.slugs.length ? language.t('Use the bookmark beside a poem to save it here.', 'ចុចសញ្ញាចំណាំនៅជាប់កំណាព្យ ដើម្បីរក្សាទុកនៅទីនេះ។') : language.t('Try a different search or theme.', 'សាកល្បងពាក្យស្វែងរក ឬប្រធានបទផ្សេងទៀត។')}</p>{#if query || theme !== 'All works'}<button class="plain-button" onclick={reset}>{language.t('Clear filters', 'សម្អាតការជ្រើសរើស')}</button>{:else if savedOnly}<a class="text-link" href="/collection">{language.t('Browse all poems →', 'មើលកំណាព្យទាំងអស់ →')}</a>{/if}</div>
 {/if}
 {#if pageCount > 1 && !pending && !loading && !loadError}<nav class="pagination" aria-label={language.t('Collection pages', 'ទំព័របណ្ដុំកំណាព្យ')}><button disabled={currentPage === 1} onclick={() => update('page', String(currentPage - 1))}>{language.t('← Previous', '← មុន')}</button><span aria-live="polite">{language.t('Page', 'ទំព័រ')} {language.number(currentPage)} {language.t('of', 'នៃ')} {language.number(pageCount)}</span><button disabled={currentPage === pageCount} onclick={() => update('page', String(currentPage + 1))}>{language.t('Next →', 'បន្ទាប់ →')}</button></nav>{/if}
</div>
