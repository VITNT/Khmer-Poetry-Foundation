import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { seedSQL } from '../scripts/generate-supabase-seed.mjs';

const db = new PGlite({ extensions: { pg_trgm } });
const alice = '11111111-1111-4111-8111-111111111111';
const bob = '22222222-2222-4222-8222-222222222222';
const admin = '33333333-3333-4333-8333-333333333333';
async function as(role, id, fn) {
 await db.exec(`set role ${role};`);
 await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({ sub: id, role })]);
 try { return await fn(); } finally { await db.exec('reset role'); }
}
async function insert(slug, status = 'draft', owner = alice) {
 return db.query(`insert into public.poems(owner_id,slug,title,khmer,author,theme,lines,status) values ($1,$2,'My poem','កំណាព្យ','A poet','Memory',array['A line'], $3) returning id`, [owner, slug, status]);
}
before(async () => {
 await db.exec(`
 create role anon; create role authenticated;
 create schema auth;
 create table auth.users (id uuid primary key);
 grant usage on schema auth to anon, authenticated;
 create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
 create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
 insert into auth.users values ('${alice}'),('${bob}'),('${admin}');
 `);
 await db.exec(readFileSync(new URL('../supabase/migrations/202611080001_poems.sql', import.meta.url), 'utf8'));
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
