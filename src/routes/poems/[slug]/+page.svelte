<script lang="ts">
 import { useLanguage } from '$lib/i18n.svelte';
 import { khmerDetails } from '$lib/khmer-details';
 const siteLanguage = useLanguage();
 import { readingList, toggleSaved } from '$lib/state.svelte';
 import WorkCard from '$lib/WorkCard.svelte';
 let { data } = $props();
 let language = $state<'English' | 'Khmer' | null>(null);
 let km = $derived(khmerDetails[data.poem.slug] || { description: data.poem.description });
 let displayLanguage = $derived((language || (siteLanguage.khmer ? 'Khmer' : 'English')) === 'English' ? (data.poem.lines.length ? 'English' : 'Khmer') : (data.poem.khmerLines.length ? 'Khmer' : 'English'));
 let fontSize = $state(22);
 let copied = $state(false);
 let shareError = $state(false);
 let related = $derived(data.related);
 async function share() { try { await navigator.clipboard.writeText(window.location.href); copied = true; setTimeout(() => copied = false, 2200); } catch { shareError = true; } }
</script>
<svelte:head><title>{siteLanguage.title(data.poem)} — {siteLanguage.t('Aksara', 'អក្សរ')}</title><meta name="description" content={siteLanguage.t(data.poem.description, km.description)}/></svelte:head>
<div class="page-width reader-page">
 <a class="back-link" href="/collection">{siteLanguage.t('← Back to the collection', '← ត្រឡប់ទៅបណ្ដុំកំណាព្យ')}</a>
 <div class="reader-heading">
  <div class="eyebrow">{siteLanguage.t('POEM', 'កំណាព្យ')} · {siteLanguage.theme(data.poem.theme)}</div>
  <h1>{siteLanguage.title(data.poem)}</h1>
  <p class="reader-khmer" class:khmer={!siteLanguage.khmer} lang={siteLanguage.khmer ? 'en' : 'km'}>{siteLanguage.khmer ? data.poem.title : data.poem.khmer}</p>
  <p class="reader-byline">{siteLanguage.t('By', 'ដោយ')} {siteLanguage.author(data.poem)}{#if data.poem.authorKhmer && !siteLanguage.khmer} <span lang="km" class="khmer">· {data.poem.authorKhmer}</span>{/if}{#if data.poem.isSample || data.poem.authorDates} <span>· {data.poem.isSample ? siteLanguage.t('Original sample', 'ស្នាដៃគំរូ') : siteLanguage.number(data.poem.authorDates === '17th century' ? siteLanguage.t('17th century', 'សតវត្សទី១៧') : data.poem.authorDates || '')}</span>{/if}</p>
  {#if data.poem.source}
   <dl class="work-facts"><div><dt>{siteLanguage.t('Published', 'ឆ្នាំបោះពុម្ព')}</dt><dd>{siteLanguage.year(data.poem)}</dd></div><div><dt>{siteLanguage.t('Form', 'ទម្រង់')}</dt><dd>{siteLanguage.form(data.poem.form || '')}</dd></div><div><dt>{siteLanguage.t('Text', 'អត្ថបទ')}</dt><dd>{siteLanguage.t('Khmer', 'ខ្មែរ')} · {siteLanguage.t(data.poem.textExtent || 'Full text', km.textExtent || 'អត្ថបទពេញ')}</dd></div><div><dt>{siteLanguage.t('Source', 'ប្រភព')}</dt><dd><a class="text-link" href={data.poem.source.url} target="_blank" rel="noreferrer">{siteLanguage.t('View source ↗', 'មើលប្រភព ↗')}</a></dd></div></dl>
   <p class="work-summary">{siteLanguage.t(data.poem.description, km.description)}</p>
  {/if}
 </div>
 <div class="reader-toolbar">
  <div class="language-tabs" role="group" aria-label={siteLanguage.t('Poem language', 'ភាសាកំណាព្យ')}><button class:selected={displayLanguage === 'English'} aria-pressed={displayLanguage === 'English'} disabled={!data.poem.lines.length} title={!data.poem.lines.length ? siteLanguage.t('English translation not yet available', 'មិនទាន់មានការបកប្រែអង់គ្លេសទេ') : siteLanguage.t('Read in English', 'អានជាភាសាអង់គ្លេស')} onclick={() => language = 'English'}>English</button><button lang="km" class:selected={displayLanguage === 'Khmer'} aria-pressed={displayLanguage === 'Khmer'} disabled={!data.poem.khmerLines.length} onclick={() => language = 'Khmer'}>ខ្មែរ</button></div>
  <div class="reader-actions"><button onclick={() => fontSize = Math.max(18, fontSize - 2)} aria-label={siteLanguage.t('Decrease text size', 'បន្ថយទំហំអក្សរ')} disabled={fontSize <= 18}>A−</button><button onclick={() => fontSize = Math.min(30, fontSize + 2)} aria-label={siteLanguage.t('Increase text size', 'បង្កើនទំហំអក្សរ')} disabled={fontSize >= 30}>A+</button><span class="toolbar-divider"></span><button class:saved={readingList.slugs.includes(data.poem.slug)} onclick={() => toggleSaved(data.poem.slug)}>{readingList.slugs.includes(data.poem.slug) ? siteLanguage.t('✓ Saved', '✓ បានរក្សាទុក') : siteLanguage.t('+ Save', '+ រក្សាទុក')}</button><button onclick={share}>{copied ? siteLanguage.t('Copied ✓', 'បានចម្លង ✓') : siteLanguage.t('Share ↗', 'ចែករំលែក ↗')}</button></div>
 </div>
 {#if !data.poem.lines.length}<p class="translation-note">{siteLanguage.t('English translation not yet available.', 'មិនទាន់មានការបកប្រែជាភាសាអង់គ្លេសទេ។')}</p>{/if}
 {#if shareError}<p role="status" class="share-message">{siteLanguage.t('Copy the page address from your browser to share this work.', 'ចម្លងអាសយដ្ឋានទំព័រពីកម្មវិធីរុករក ដើម្បីចែករំលែកស្នាដៃនេះ។')}</p>{/if}
 <article class="poem-body" style={`font-size:${fontSize}px`} lang={displayLanguage === 'Khmer' ? 'km' : 'en'} class:khmer={displayLanguage === 'Khmer'}>
  {#each (displayLanguage === 'Khmer' ? data.poem.khmerLines : data.poem.lines) as line}
   {#if line}
    {@const columns = displayLanguage === 'Khmer' ? line.split('\u2003') : [line]}
    <p class:verse-row={columns.length > 1} style:--verse-columns={columns.length}>
     {#each columns as column}<span>{column}</span>{' '}{/each}
    </p>
   {:else}<div class="stanza-break"></div>{/if}
  {/each}
 </article>
 {#if data.poem.source}
  <section class="text-provenance" aria-labelledby="source-heading">
   <h2 id="source-heading">{siteLanguage.t('About this text', 'អំពីអត្ថបទនេះ')}</h2>
   <dl><div><dt>{siteLanguage.t('Publication date', 'កាលបរិច្ឆេទបោះពុម្ព')}</dt><dd>{siteLanguage.t(data.poem.publicationNote || '', km.publicationNote || '')}</dd></div><div><dt>{siteLanguage.t('Source', 'ប្រភព')}</dt><dd><a href={data.poem.source.url} target="_blank" rel="noreferrer">{data.poem.source.name}{#if data.poem.source.revision} · {siteLanguage.t('revision', 'កំណែ')} {siteLanguage.number(data.poem.source.revision)}{/if} ↗</a> · {siteLanguage.t('accessed', 'បានចូលមើល')} {siteLanguage.number(data.poem.source.accessed)}</dd></div>{#if data.poem.source.editionUrl}<div><dt>{siteLanguage.t('Longer text', 'អត្ថបទវែង')}</dt><dd><a href={data.poem.source.editionUrl} target="_blank" rel="noreferrer">{siteLanguage.t('Edition details and full source text ↗', 'ព័ត៌មានបោះពុម្ព និងអត្ថបទពេញ ↗')}</a></dd></div>{/if}<div><dt>{siteLanguage.t('Author details', 'ព័ត៌មានអ្នកនិពន្ធ')}</dt><dd><a href={data.poem.source.authorUrl} target="_blank" rel="noreferrer">{siteLanguage.t('Author reference ↗', 'ឯកសារយោងអំពីអ្នកនិពន្ធ ↗')}</a></dd></div><div><dt>{siteLanguage.t('Original work', 'ស្នាដៃដើម')}</dt><dd>{siteLanguage.t(data.poem.source.rights, km.rights || data.poem.source.rights)}</dd></div><div><dt>{siteLanguage.t('Transcription', 'ការចម្លងអត្ថបទ')}</dt><dd>{siteLanguage.t(data.poem.source.credit || 'Credit: Wikisource contributors.', km.credit || 'ឥណទាន៖ អ្នកចូលរួមចំណែកក្នុង Wikisource។')} {#if data.poem.source.license && data.poem.source.licenseUrl}<a href={data.poem.source.licenseUrl} target="_blank" rel="noreferrer">{data.poem.source.license} ↗</a>. {/if}{siteLanguage.t(data.poem.source.editorialNote, km.editorialNote || data.poem.source.editorialNote)}</dd></div></dl>
  </section>
 {:else if data.poem.isSample}<p class="reader-note sample-note">{siteLanguage.t('Original sample poem. Khmer and English companion drafts; awaiting editorial review.', 'កំណាព្យគំរូ។ អត្ថបទខ្មែរ និងអង់គ្លេសនៅជាសេចក្ដីព្រាង ដែលរង់ចាំការពិនិត្យកែសម្រួល។')}</p>{:else}<p class="reader-note sample-note">{siteLanguage.t('Shared by a member of the Aksara community.', 'ចែករំលែកដោយសមាជិកសហគមន៍អក្សរ។')}</p>{/if}
 <section class="section-block"><div class="section-heading"><h2>{siteLanguage.t('More poems', 'កំណាព្យផ្សេងទៀត')}</h2></div><div class="work-grid">{#each related as poem}<WorkCard {poem}/>{/each}</div></section>
</div>
