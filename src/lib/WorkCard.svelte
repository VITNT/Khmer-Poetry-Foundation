<script lang="ts">
 import type { PoemSummary } from './content';
 import { useLanguage } from './i18n.svelte';
 let { poem }: { poem: PoemSummary } = $props();
 const language = useLanguage();
</script>
<article class="related-work"><a href={`/poems/${poem.slug}`}><h3>{language.title(poem)}</h3><p class:khmer={!language.khmer} lang={language.khmer ? 'en' : 'km'}>{language.khmer ? poem.title : poem.khmer}</p></a><span>{poem.isExcerpt ? language.t('Excerpt · ', 'ដកស្រង់ · ') : ''}{language.theme(poem.theme)}</span></article>
