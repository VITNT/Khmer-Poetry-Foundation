import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CollectionResult, CollectionStats, Poem, PoemSummary, Submission } from '$lib/content';
import { normalizeSearch, pageSize, themeNames, type CollectionOptions } from '$lib/catalog';

export const summaryColumns = 'slug,title,khmer,author,author_khmer,theme,is_sample,is_excerpt,year_label,form';
type Row = Record<string, any>;
export function toSummary(row: Row): PoemSummary {
 return { slug: row.slug, title: row.title, khmer: row.khmer, author: row.author, authorKhmer: row.author_khmer, theme: row.theme, isSample: row.is_sample, isExcerpt: row.is_excerpt, yearLabel: row.year_label || undefined, form: row.form || undefined };
}
export function toPoem(row: Row): Poem {
 return { ...row.details, ...toSummary(row), description: row.description, lines: row.lines, khmerLines: row.khmer_lines };
}
export function toSubmission(row: Row): Submission {
 return { ...toPoem(row), id: row.id, status: row.status, updatedAt: row.updated_at };
}
export function databaseError(cause: { message: string }) {
 console.error('Supabase query failed:', cause.message);
 error(503, 'The collection is temporarily unavailable. Please try again shortly.');
}
export async function listPoems(db: SupabaseClient | null, options: CollectionOptions): Promise<CollectionResult> {
 const query = normalizeSearch(options.query);
 if (!db) {
  const { poems } = await import('./seed');
  const matches = poems.filter(p => (!options.slugs || options.slugs.includes(p.slug)) && (options.theme === 'All works' || p.theme === options.theme) && normalizeSearch([p.title, p.khmer, p.author, p.authorKhmer || '', p.theme, themeNames[p.theme] || '', p.yearLabel || '', p.form || '', ...p.lines, ...p.khmerLines].join(' ')).includes(query));
  matches.sort((a, b) => (options.sort === 'asc' ? 1 : -1) * ((options.locale === 'km' ? a.khmer : a.title).localeCompare(options.locale === 'km' ? b.khmer : b.title, options.locale) || a.slug.localeCompare(b.slug)));
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = Math.min(options.page, pageCount);
  return { poems: matches.slice((page - 1) * pageSize, page * pageSize).map(({ lines, khmerLines, source, description, ...p }) => p), total: matches.length, page, pageCount };
 }
 if (options.slugs?.length === 0) return { poems: [], total: 0, page: 1, pageCount: 1 };
 const filtered = () => {
  let request = db.from('poems').select(summaryColumns, { count: 'exact' }).eq('status', 'published');
  if (options.theme !== 'All works') request = request.eq('theme', options.theme);
  if (query) request = request.like('search_text', `%${query.replace(/[\\%_]/g, '\\$&')}%`);
  if (options.slugs) request = request.in('slug', options.slugs);
  return request.order(options.locale === 'km' ? 'khmer' : 'title', { ascending: options.sort === 'asc' }).order('slug', { ascending: true });
 };
 let result = await filtered().range((options.page - 1) * pageSize, options.page * pageSize - 1);
 if (result.error) databaseError(result.error);
 const total = result.count || 0;
 const pageCount = Math.max(1, Math.ceil(total / pageSize));
 const page = Math.min(options.page, pageCount);
 if (page !== options.page) {
  result = await filtered().range((page - 1) * pageSize, page * pageSize - 1);
  if (result.error) databaseError(result.error);
 }
 return { poems: (result.data || []).map(toSummary), total, page, pageCount };
}
export async function collectionStats(db: SupabaseClient | null): Promise<CollectionStats> {
 if (!db) {
  const { poems, sourcedCount, sampleCount, themes } = await import('./seed');
  return { total: poems.length, sourcedCount, sampleCount, communityCount: 0, themes: themes.filter(theme => theme !== 'All works') };
 }
 const result = await db.rpc('collection_stats');
 if (result.error) databaseError(result.error);
 return result.data as CollectionStats;
}
export async function poemBySlug(db: SupabaseClient | null, slug: string) {
 if (!db) {
  const { poems } = await import('./seed');
  const poem = poems.find(p => p.slug === slug);
  if (!poem) error(404, 'This work could not be found.');
  return { poem, related: poems.filter(p => p.slug !== slug && !!p.isSample === !!poem.isSample).slice(0, 3).map(p => ({ ...p, lines: undefined, khmerLines: undefined, source: undefined })) as PoemSummary[] };
 }
 const { data, error: cause } = await db.from('poems').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
 if (cause) databaseError(cause);
 if (!data) error(404, 'This work could not be found.');
 const related = await db.from('poems').select(summaryColumns).eq('status', 'published').neq('slug', slug).eq('is_sample', data.is_sample).order('slug').limit(3);
 if (related.error) databaseError(related.error);
 return { poem: toPoem(data), related: (related.data || []).map(toSummary) };
}
