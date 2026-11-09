<script lang="ts">
 import { useLanguage } from '$lib/i18n.svelte';
 const language = useLanguage();
 let khmer = $derived(language.khmer);
</script>
<svelte:head><title>{khmer ? 'អក្សរ — កំណាព្យ និងអក្សរសិល្ប៍ខ្មែរ' : 'Aksara — Khmer poetry and literature'}</title></svelte:head>
<section class="page-width purpose-page" class:is-khmer={khmer} lang={khmer ? 'km' : 'en'}>
 <div class="purpose-copy">
  {#if khmer}
   <h1>កំណាព្យខ្មែរ<br />សម្រាប់គ្រប់គ្នា។</h1>
   <p>អក្សរ ជាកន្លែងប្រមូលផ្ដុំកំណាព្យ និងអក្សរសិល្ប៍ខ្មែរ។ យើងកំពុងកសាងបណ្ដុំស្នាដៃ ដើម្បីឱ្យអ្នកអានងាយស្រួលស្វែងរក អាន និងត្រឡប់មកអានម្ដងទៀត។</p>
   <p>ស្វែងយល់ពីកំណាព្យជាភាសាខ្មែរ និងអង់គ្លេស ជ្រើសរើសតាមប្រធានបទ និងរក្សាទុកស្នាដៃដែលអ្នកចង់អានម្ដងទៀត។</p>
   <a class="primary-button" href="/collection">អានកំណាព្យ <span aria-hidden="true">→</span></a>
  {:else}
   <h1>Khmer poetry,<br />for everyone.</h1>
   <p>Aksara is a home for Khmer poetry and literature. We’re building a collection that makes these works easier to discover, read, and return to.</p>
   <p>Explore poems in Khmer and English, browse by theme, and save the works you want to revisit.</p>
   <a class="primary-button" href="/collection">Browse poems <span aria-hidden="true">→</span></a>
  {/if}
 </div>
</section>
