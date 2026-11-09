import { getContext } from 'svelte';
import { browser } from '$app/environment';
import type { PoemSummary } from './content';
import { themeNames } from './catalog';
import { invalidateAll } from '$app/navigation';

export type Locale = 'en' | 'km';
export const LANGUAGE_CONTEXT = Symbol('site-language');
const formNames: Record<string, string> = {
 'Kakagati (បទកាកគតិ)': 'បទកាកគតិ', 'Prohmkeat (បទព្រហ្មគីតិ)': 'បទព្រហ្មគីតិ', 'Seven-syllable verse (បទពាក្យ៧)': 'បទពាក្យ៧', 'Eight-syllable travel verse (បទពាក្យ៨)': 'កំណាព្យនិរាស បទពាក្យ៨', 'Didactic verse': 'កាព្យឧបទេស'
};
export class SiteLanguage {
 locale = $state<Locale>('en');
 constructor(locale: Locale) { this.locale = locale; }
 get khmer() { return this.locale === 'km'; }
 t(en: string, km: string) { return this.khmer ? km : en; }
 number(value: string | number) { return this.khmer ? String(value).replace(/\d/g, digit => '០១២៣៤៥៦៧៨៩'[Number(digit)]) : String(value); }
 theme(value: string) { return this.khmer ? themeNames[value] || value : value === 'All works' ? 'All poems' : value; }
 title(poem: PoemSummary) { return this.khmer ? poem.khmer : poem.title; }
 author(poem: PoemSummary) {
  if (!this.khmer) return poem.author;
  if (poem.isSample) return 'ក្រុមការងារអក្សរ';
  return (poem.authorKhmer || poem.author) + (poem.author.includes('(attributed)') ? ' (សន្មត)' : '');
 }
 year(poem: PoemSummary) {
  const value = poem.yearLabel || 'Unknown';
  if (!this.khmer) return value;
  return this.number(value.replace('Unknown', 'មិនទាន់ដឹង').replace('Sample', 'ស្នាដៃគំរូ').replace('c. ', 'ប្រហែល '));
 }
 form(value: string) { return this.khmer ? formNames[value] || value : value; }
 setLocale(locale: Locale) {
  if (this.locale === locale) return;
  this.locale = locale;
  if (browser) {
   document.cookie = `aksara-language=${this.locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
   void invalidateAll();
  }
 }
}
export function useLanguage() { return getContext<SiteLanguage>(LANGUAGE_CONTEXT); }
