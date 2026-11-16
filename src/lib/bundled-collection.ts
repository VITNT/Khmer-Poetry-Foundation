import samples from './data/sample-poems.json';
import { normalizeSearch, pageSize, themeNames, type CollectionOptions } from './catalog';
import type { CollectionResult, CollectionStats, PoemSummary } from './content';

// Six small poems ship with the client; the larger archive stays in the database.
export function bundledCollection(options: CollectionOptions): CollectionResult {
 const query = normalizeSearch(options.query);
 const matches = samples.filter(p => (options.theme === 'All works' || options.theme === p.theme)
  && normalizeSearch([p.title, p.khmer, p.author, p.theme, themeNames[p.theme] || '', ...p.lines, ...p.khmerLines].join(' ')).includes(query));
 matches.sort((a, b) => (options.sort === 'asc' ? 1 : -1) * (options.locale === 'km' ? a.khmer.localeCompare(b.khmer, 'km') : a.title.localeCompare(b.title, 'en')) || a.slug.localeCompare(b.slug));
 const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
 const page = Math.min(options.page, pageCount);
 const poems: PoemSummary[] = matches.slice((page - 1) * pageSize, page * pageSize).map(({ lines, khmerLines, description, ...summary }) => summary);
 return { poems, total: matches.length, page, pageCount };
}
export const bundledStats: CollectionStats = { total: samples.length, sourcedCount: 0, sampleCount: samples.length, communityCount: 0, themes: [...new Set(samples.map(p => p.theme))] };
