import { error } from '@sveltejs/kit';
import { publicPoemCache } from './public-poem-cache';
import type { Database } from './database';
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
export function databaseError(cause: { message: string }): never {
 console.error('Database query failed:', cause.message);
 error(503, 'The collection is temporarily unavailable. Please try again shortly.');
}
export async function listPoems(db: Database | null, options: CollectionOptions): Promise<CollectionResult> {
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
 const values: unknown[] = [];
 const where = ["status = 'published'"];
 const param = (value: unknown) => { values.push(value); return `$${values.length}`; };
 if (options.theme !== 'All works') where.push(`theme = ${param(options.theme)}`);
 if (query) where.push(`search_text like ${param('%' + query.replace(/[\\%_]/g, '\\$&') + '%')}`);
 if (options.slugs) where.push(`slug = any(${param(options.slugs)}::text[])`);
 const condition = where.join(' and ');
 try {
  const order = options.locale === 'km' ? 'khmer' : 'title';
  // Count and fetch the clamped page in one database round trip, including empty results.
  const result = await db.query(`
   with totals as (select count(*)::int as total from poems where ${condition}),
   pagination as (select total, greatest(1, ceil(total::numeric / ${pageSize})::int) as page_count from totals),
   bounds as (select *, least(${param(options.page)}::int, page_count) as page from pagination)
   select total, page, page_count,
    (select coalesce(jsonb_agg(row_to_json(items)), '[]'::jsonb) from (
     select ${summaryColumns} from poems where ${condition}
     order by ${order} ${options.sort === 'asc' ? 'asc' : 'desc'}, slug
     limit ${pageSize} offset (select (page - 1) * ${pageSize} from bounds)
    ) items) as poems
   from bounds`, values);
  const row = result.rows[0];
  return { poems: row.poems.map(toSummary), total: row.total, page: row.page, pageCount: row.page_count };
 } catch (cause) { databaseError(cause as Error); }

}
async function uncachedCollectionStats(db: Database | null): Promise<CollectionStats> {
 if (!db) {
  const { poems, sourcedCount, sampleCount, themes } = await import('./seed');
  return { total: poems.length, sourcedCount, sampleCount, communityCount: 0, themes: themes.filter(theme => theme !== 'All works') };
 }
 try {
  const result = await db.query('select public.collection_stats() as stats');
  return result.rows[0].stats as CollectionStats;
 } catch (cause) { databaseError(cause as Error); }
}
async function uncachedPoemBySlug(db: Database | null, slug: string) {
 if (!db) {
  const { poems } = await import('./seed');
  const poem = poems.find(p => p.slug === slug);
  if (!poem) error(404, 'This work could not be found.');
  return { poem, related: poems.filter(p => p.slug !== slug && !!p.isSample === !!poem.isSample).slice(0, 3).map(p => ({ ...p, lines: undefined, khmerLines: undefined, source: undefined })) as PoemSummary[] };
 }
 let data: Row;
 let related: Row[];
 try {
  const result = await db.query(`
   select p.*, (
    select coalesce(jsonb_agg(row_to_json(items)), '[]'::jsonb) from (
     select ${summaryColumns} from poems
     where status = 'published' and slug <> $1 and is_sample = p.is_sample
     order by slug limit 3
    ) items
   ) as related
   from poems p where p.slug = $1 and p.status = 'published'`, [slug]);
  if (!result.rows[0]) error(404, 'This work could not be found.');
  data = result.rows[0];
  related = data.related;
 } catch (cause) {
  if (typeof cause === 'object' && cause && 'status' in cause) throw cause;
  databaseError(cause as Error);
 }
 return { poem: toPoem(data), related: related.map(toSummary) };
}

// Only explicitly public data is shared; personalized lists and drafts never enter this cache.
export function collectionStats(db: Database | null): Promise<CollectionStats> {
 return db ? publicPoemCache.get('stats', () => uncachedCollectionStats(db)) : uncachedCollectionStats(db);
}
export function poemBySlug(db: Database | null, slug: string) {
 return db ? publicPoemCache.get(`poem:${slug}`, () => uncachedPoemBySlug(db, slug)) : uncachedPoemBySlug(db, slug);
}
