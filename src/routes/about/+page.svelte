<script lang="ts">
 import { useLanguage } from '$lib/i18n.svelte';
 const language = useLanguage();
 let { data } = $props();
 let sourcedCount = $derived(data.stats.sourcedCount);
 let sampleCount = $derived(data.stats.sampleCount);
</script>
<svelte:head><title>{language.t('About — Aksara', 'អំពីយើង — អក្សរ')}</title></svelte:head>
<section class="page-width about-page"><h1>{language.t('About Aksara', 'អំពីអក្សរ')}</h1><div class="about-prose">
 {#if language.khmer}
  <p>អក្សរ ជាបណ្ដុំកំណាព្យខ្មែរ ដែលមានអត្ថបទជាភាសាខ្មែរ និងអង់គ្លេស។</p>
  <p>បណ្ដុំនេះមានស្នាដៃប្រវត្តិសាស្ត្រចំនួន {language.number(sourcedCount)} ដែលមានប្រភពច្បាស់លាស់ រួមមានស្នាដៃរបស់ក្រមង៉ុយ និងសុត្តន្តប្រីជា ឥន្ទ ព្រមទាំងស្នាដៃដែលសន្មតថាជារបស់ព្រះបាទអង្គឌួង និងព្រះរាជសម្ភារ។ ក៏មានកំណាព្យគំរូចំនួន {language.number(sampleCount)} ផងដែរ។</p>
  <p>ស្នាដៃប្រវត្តិសាស្ត្រនីមួយៗមានប្រភព ព័ត៌មានកាលបរិច្ឆេទ ទម្រង់កំណាព្យ និងព័ត៌មានសិទ្ធិប្រើប្រាស់។ អត្ថបទដកស្រង់ និងការសន្មតអំពីអ្នកនិពន្ធត្រូវបានសម្គាល់។ ស្នាដៃប្រវត្តិសាស្ត្រទាំងនេះមិនទាន់មានការបកប្រែជាភាសាអង់គ្លេសទេ។</p>
  <p>អត្ថបទខ្មែរ និងអង់គ្លេសនៃកំណាព្យគំរូនៅជាសេចក្ដីព្រាង ដែលត្រូវការការពិនិត្យកែសម្រួល។</p>
 {:else}
  <p>Aksara (អក្សរ) is a collection of Khmer poetry, with texts in Khmer and English.</p>
  <p>The collection includes {sourcedCount} sourced historical works, including verse by Krom Ngoy and Suttantaprija Ind and works attributed to Ang Duong and Preah Reach Samphear, alongside {sampleCount} original demonstration poems. Each historical work includes its source, date information, poetic form, and reuse details. Excerpts and uncertain attributions are labeled. English translations of the historical works are not yet available.</p>
  <p>The sample poems’ Khmer and English versions are companion drafts awaiting editorial review.</p>
 {/if}
 <a class="text-link" href="/collection">{language.t('Browse the collection →', 'មើលបណ្ដុំកំណាព្យ →')}</a>
</div></section>
