import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { seedSQL } from '../scripts/generate-neon-seed.mjs';

const db = new PGlite({ extensions: { pg_trgm } });
const alice = '11111111-1111-4111-8111-111111111111';
const bob = '22222222-2222-4222-8222-222222222222';
const admin = '33333333-3333-4333-8333-333333333333';
async function as(role, id, fn) {
 await db.exec(`set role ${role};`);
 await db.query("select set_config('app.user_id', $1, false)", [id || '']);
 try { return await fn(); } finally { await db.exec('reset role'); }
}
async function insert(slug, status = 'draft', owner = alice) {
 return db.query(`insert into public.poems(owner_id,slug,title,khmer,author,theme,lines,status) values ($1,$2,'My poem','កំណាព្យ','A poet','Memory',array['A line'], $3) returning id`, [owner, slug, status]);
}
before(async () => {
 await db.exec(`
 create table public."user" (id text primary key);
 insert into public."user" values ('${alice}'),('${bob}'),('${admin}');
 `);
 await db.exec(readFileSync(new URL('../neon/migrations/202611080001_poems.sql', import.meta.url), 'utf8'));
 await db.query('insert into private.site_admins values ($1)', [admin]);
 await db.exec(seedSQL());
});
after(() => db.close());

test('seed preserves all 15 works and is safe to rerun', async () => {
 await db.exec(seedSQL());
 const result = await as('anon', null, () => db.query('select public.collection_stats() as stats'));
 assert.equal(result.rows[0].stats.total, 15);
 assert.equal(result.rows[0].stats.sourcedCount, 9);
 assert.equal(result.rows[0].stats.sampleCount, 6);
 const source = await db.query("select details->'source' as source from poems where slug='chbab-lboek-thmei'");
 assert.ok(source.rows[0].source.sha256);
});
test('anonymous readers cannot write and can see only published poems', async () => {
 await assert.rejects(as('anon', null, () => insert('anonymous')), /permission denied/);
 await as('authenticated', alice, () => insert('private-draft'));
 const read = await as('anon', null, () => db.query("select slug from poems where slug='private-draft'"));
 assert.equal(read.rows.length, 0);
});
test('authors cannot impersonate another user, self-publish, or write protected metadata', async () => {
 await assert.rejects(as('authenticated', alice, () => insert('impersonation', 'draft', bob)), /row-level security/);
 await assert.rejects(as('authenticated', alice, () => insert('self-published', 'published')), /row-level security/);
 await assert.rejects(as('authenticated', alice, () => db.exec("update poems set status='published' where slug='private-draft'")), /row-level security/);
 await assert.rejects(as('authenticated', alice, () => db.exec("update poems set details='{\"source\":{}}' where slug='private-draft'")), /permission denied/);
 await assert.rejects(as('authenticated', alice, () => db.exec(`insert into private.site_admins values ('${alice}')`)), /permission denied/);
});
test('other authors cannot read or edit private drafts', async () => {
 const read = await as('authenticated', bob, () => db.query("select id from poems where slug='private-draft'"));
 assert.equal(read.rows.length, 0);
 const update = await as('authenticated', bob, () => db.query("update poems set title='Stolen' where slug='private-draft' returning id"));
 assert.equal(update.rows.length, 0);
});
test('pending submissions are locked; editors can return them for revision and publish', async () => {
 await as('authenticated', alice, () => db.exec("update poems set status='pending' where slug='private-draft'"));
 const edit = await as('authenticated', alice, () => db.query("update poems set title='Changed during review' where slug='private-draft' returning id"));
 assert.equal(edit.rows.length, 0);
 const pending = await as('authenticated', admin, () => db.query("select id from poems where status='pending'"));
 assert.equal(pending.rows.length, 1);
 await as('authenticated', admin, () => db.exec("update poems set status='rejected' where slug='private-draft'"));
 await as('authenticated', alice, () => db.exec("update poems set title='Revised',status='pending' where slug='private-draft'"));
 await as('authenticated', admin, () => db.exec("update poems set status='published' where slug='private-draft'"));
 const published = await as('anon', null, () => db.query("select title from poems where slug='private-draft'"));
 assert.equal(published.rows[0].title, 'Revised');
});
test('Khmer search normalizes zero-width spaces and Khmer numerals', async () => {
 const normalized = await db.query("select public.normalize_poem_search('កំណា' || U&'\\200B' || 'ព្យ ១៩២២') as value");
 assert.equal(normalized.rows[0].value, 'កំណាព្យ 1922');
 const matches = await as('anon', null, () => db.query("select slug from poems where status='published' and search_text like '%' || public.normalize_poem_search('១៩២២') || '%'"));
 assert.ok(matches.rows.some(p => p.slug === 'chbab-lboek-thmei'));
});
test('body limits and the daily creation cap apply at the database', async () => {
 await assert.rejects(as('authenticated', bob, () => db.query(`insert into poems(owner_id,slug,title,khmer,author,theme,lines) values ($1,'too-long','T','T','A','Memory',array[$2])`, [bob, 'x'.repeat(50001)])), /check constraint/);
 for (let i = 0; i < 10; i++) await as('authenticated', bob, () => insert(`rate-limit-${i}`, 'draft', bob));
 await assert.rejects(as('authenticated', bob, () => insert('rate-limit-excess', 'draft', bob)), /Daily limit/);
});

// Execute the actual server queries against PostgreSQL, not a mock query builder.
test('server queries save and edit drafts, reject stale writes, and escape search wildcards', async () => {
 const { moduleURL } = await import('./load-server-module.mjs');
 const { createDatabase } = await import(moduleURL('src/lib/server/database.ts'));
 const { saveSubmission, loadSubmission } = await import(moduleURL('src/lib/server/submissions.ts'));
 const { listPoems } = await import(moduleURL('src/lib/server/poems.ts'));
 const connection = { query: (sql, values) => db.query(sql, values), release() {} };
 const pool = { connect: async () => connection };
 const queries = createDatabase(pool, alice);
 const form = () => {
  const data = new FormData();
  for (const [key, value] of Object.entries({ title: 'Query test', author: 'Alice', theme: 'Memory', englishText: 'A line', permission: 'yes' })) data.set(key, value);
  return data;
 };
 const event = (data, id) => ({ locals: { db: queries, user: { id: alice } }, params: { id }, request: { formData: async () => data } });
 await assert.rejects(saveSubmission(event(form()), 'draft'), e => e.status === 303);
 const saved = await db.query("select id, updated_at::text as updated from poems where title = 'Query test'");
 const id = saved.rows[0].id;
 assert.equal((await loadSubmission(event(form(), id))).title, 'Query test');
 const revised = form();
 revised.set('updatedAt', saved.rows[0].updated);
 revised.set('title', 'Query revised');
 await assert.rejects(saveSubmission(event(revised, id), 'draft', true), e => e.status === 303);
 const stale = await saveSubmission(event(revised, id), 'draft', true);
 assert.equal(stale.status, 409);
 const options = { query: '%', theme: 'All works', locale: 'en', sort: 'asc', page: 1 };
 const search = await listPoems(createDatabase(pool, null), options);
 assert.equal(search.total, 0);
 const publicResult = await listPoems(createDatabase(pool, null), { ...options, query: '' });
 assert.ok(publicResult.total >= 15);
 // Transaction-local identity and role must not leak onto pooled connections.
 const identity = await db.query("select current_user, nullif(current_setting('app.user_id', true), '') as id");
 assert.notEqual(identity.rows[0].current_user, 'authenticated');
});

test('public page queries use one read and preserve paging, search, and privacy', async () => {
 const { moduleURL } = await import('./load-server-module.mjs');
 const { listPoems, poemBySlug } = await import(moduleURL('src/lib/server/poems.ts'));
 const { publicPoemCache } = await import(moduleURL('src/lib/server/public-poem-cache.ts'));
 publicPoemCache.clear();
 let reads = 0;
 const reader = { query: (text, values) => {
  reads++;
  return as('anon', null, () => db.query(text, values));
 } };
 const options = { query: '', theme: 'All works', locale: 'en', sort: 'asc', page: 100000 };
 const page = await listPoems(reader, options);
 assert.equal(reads, 1);
 assert.equal(page.page, page.pageCount);
 assert.ok(page.poems.length > 0);
 const empty = await listPoems(reader, { ...options, query: 'no-such-poem-xyz' });
 assert.deepEqual(empty, { poems: [], total: 0, page: 1, pageCount: 1 });
 const filtered = await listPoems(reader, { ...options, slugs: ['chbab-lboek-thmei'], locale: 'km', sort: 'desc' });
 assert.equal(filtered.total, 1);
 assert.equal(filtered.poems[0].slug, 'chbab-lboek-thmei');
 const before = reads;
 const detail = await poemBySlug(reader, 'chbab-lboek-thmei');
 assert.equal(reads, before + 1);
 assert.equal(detail.poem.slug, 'chbab-lboek-thmei');
 assert.equal(detail.related.length, 3);
 assert.ok(detail.related.every(p => p.slug !== detail.poem.slug && p.lines === undefined));
 await poemBySlug(reader, 'chbab-lboek-thmei');
 assert.equal(reads, before + 1);
 await assert.rejects(poemBySlug(reader, 'missing-poem'), e => e.status === 404);
});
