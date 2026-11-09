import { browser } from '$app/environment';
let initial: string[] = [];
if (browser) { try { initial = JSON.parse(localStorage.getItem('aksara-saved') || '[]'); if (!Array.isArray(initial)) initial = []; initial = [...new Set(initial.filter(s => typeof s === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(s)))].slice(0, 500); } catch { initial = []; } }
export const readingList = $state({ slugs: initial });
export function toggleSaved(slug: string) { if (!readingList.slugs.includes(slug) && readingList.slugs.length >= 500) return; readingList.slugs = readingList.slugs.includes(slug) ? readingList.slugs.filter(s => s !== slug) : [...readingList.slugs, slug]; if (browser) { try { localStorage.setItem('aksara-saved', JSON.stringify(readingList.slugs)); } catch { /* Keep the in-memory list usable when storage is unavailable. */ } } }
