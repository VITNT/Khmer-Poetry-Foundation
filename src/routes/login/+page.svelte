<script lang="ts">
 import { enhance } from '$app/forms';
 import { useLanguage } from '$lib/i18n.svelte';
 const language = useLanguage();
 let { data, form } = $props();
 let busy = $state(false);
</script>
<svelte:head><title>{language.t('Sign in', 'ចូលគណនី')} — Aksara</title></svelte:head>
<section class="page-width account-page narrow-page">
 <div class="landing-intro"><h1>{language.t('A place for your words.', 'កន្លែងសម្រាប់ស្នាដៃរបស់អ្នក។')}</h1><p>{language.t('Sign in or create an account with an email link. No password needed.', 'ចូល ឬបង្កើតគណនីតាមតំណអ៊ីមែល។ មិនត្រូវការពាក្យសម្ងាត់ទេ។')}</p></div>
 {#if data.callbackError}<p class="form-notice error" role="alert">{language.t('That sign-in link expired or could not be verified. Request a new one below.', 'តំណចូលគណនីផុតកំណត់ ឬមិនអាចផ្ទៀងផ្ទាត់បាន។ សូមស្នើសុំតំណថ្មី។')}</p>{/if}
 {#if form?.message}<p class="form-notice" class:error={!form.sent} role={form.sent ? 'status' : 'alert'}>{form.message}</p>{/if}
 {#if data.configured}
  <form method="POST" class="editor-form" use:enhance={() => { busy = true; return async ({ update }) => { await update({ reset: false }); busy = false; }; }}>
   <input type="hidden" name="next" value={data.next} />
   <label>{language.t('Email address', 'អាសយដ្ឋានអ៊ីមែល')}<input name="email" type="email" autocomplete="email" required maxlength="254" value={form?.email || ''} /></label>
   <button class="primary-button" disabled={busy}>{busy ? language.t('Sending…', 'កំពុងផ្ញើ…') : language.t('Email me a sign-in link', 'ផ្ញើតំណចូលគណនីតាមអ៊ីមែល')}</button>
  </form>
 {:else}<p class="form-notice">{language.t('Accounts and submissions will be available once the site is connected.', 'គណនី និងការដាក់ស្នើនឹងមាននៅពេលគេហទំព័រត្រូវបានភ្ជាប់។')}</p>{/if}
</section>
