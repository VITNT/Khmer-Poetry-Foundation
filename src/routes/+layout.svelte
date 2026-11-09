<script lang="ts">
 import '../app.css';
 import { setContext, untrack } from 'svelte';
 import { page } from '$app/state';
 import { readingList } from '$lib/state.svelte';
 import { SiteLanguage, LANGUAGE_CONTEXT } from '$lib/i18n.svelte';
 let { data, children } = $props();
 const language = setContext(LANGUAGE_CONTEXT, new SiteLanguage(untrack(() => data.locale)));
 $effect(() => { document.documentElement.lang = language.locale; });
</script>
<svelte:head><meta name="description" content={language.t('Browse Khmer poetry in Khmer and English. Search the collection, explore themes, and save poems to your reading list.', 'អានកំណាព្យជាភាសាខ្មែរ និងអង់គ្លេស។ ស្វែងរកស្នាដៃតាមប្រធានបទ និងរក្សាទុកកំណាព្យក្នុងបញ្ជីអានរបស់អ្នក។')}/></svelte:head>
<div class="site-shell" class:is-khmer={language.khmer} lang={language.locale}>
 <a class="skip-link" href="#main">{language.t('Skip to content', 'រំលងទៅមាតិកា')}</a>
 <header class="site-header page-width">
  <a href="/" class="wordmark" aria-label={language.t('Aksara home', 'ទំព័រដើមអក្សរ')}><span lang="km">អក្សរ</span><span class="logo-latin" lang="en">Aksara</span></a>
  <nav aria-label={language.t('Main navigation', 'ម៉ឺនុយមេ')}>
   <a class:active={page.url.pathname === '/'} href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}>{language.t('Home', 'ទំព័រដើម')}</a>
   <a class:active={page.url.pathname === '/collection' && !page.url.searchParams.has('saved')} href="/collection" aria-current={page.url.pathname === '/collection' && !page.url.searchParams.has('saved') ? 'page' : undefined}>{language.t('Poems', 'កំណាព្យ')}</a>
   <a class:active={page.url.searchParams.has('saved')} href="/collection?saved=1" aria-current={page.url.searchParams.has('saved') ? 'page' : undefined}>{language.t('Reading list', 'បញ្ជីអាន')}{readingList.slugs.length ? ` (${language.number(readingList.slugs.length)})` : ''}</a>
   <a class:active={page.url.pathname.startsWith('/submit')} href="/submit">{language.t('Write', 'សរសេរ')}</a>
   {#if data.isAdmin}<a href="/admin" class:active={page.url.pathname === '/admin'}>{language.t('Review', 'ពិនិត្យ')}</a>{/if}
   <a href={data.user ? '/account' : '/login'} class:active={page.url.pathname === '/account' || page.url.pathname === '/login'}>{data.user ? language.t('My poems', 'កំណាព្យខ្ញុំ') : language.t('Sign in', 'ចូលគណនី')}</a>
   <div class="nav-language" role="group" aria-label={language.t('Site language', 'ភាសាគេហទំព័រ')}>
    <button type="button" lang="en" class:selected={!language.khmer} aria-pressed={!language.khmer} onclick={() => language.setLocale('en')}>English</button>
    <button type="button" lang="km" class:selected={language.khmer} aria-pressed={language.khmer} onclick={() => language.setLocale('km')}>ខ្មែរ</button>
   </div>
  </nav>
 </header>
 <main id="main">{@render children()}</main>
 <footer class="site-footer page-width"><span>© {language.number(new Date().getFullYear())} {language.t('Aksara', 'អក្សរ')}</span><a href="/about">{language.t('About', 'អំពីយើង')}</a></footer>
</div>
