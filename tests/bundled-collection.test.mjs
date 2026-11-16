import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moduleURL } from './load-server-module.mjs';
const { bundledCollection, bundledStats } = await import(moduleURL('src/lib/bundled-collection.ts'));
const options = { query: '', theme: 'All works', sort: 'asc', locale: 'en', page: 1 };

test('bundled preview contains six summaries and respects search and filters', () => {
 const result = bundledCollection(options);
 assert.equal(result.total, 6);
 assert.equal(bundledStats.sampleCount, 6);
 assert.ok(result.poems.every(poem => poem.lines === undefined && poem.khmerLines === undefined));
 assert.deepEqual(result.poems.map(p => p.title), result.poems.map(p => p.title).sort((a, b) => a.localeCompare(b, 'en')));
 const match = bundledCollection({ ...options, query: 'ទន្លេចងចាំ', page: 100 });
 assert.equal(match.poems[0].slug, 'the-river-remembers');
 assert.equal(match.page, 1);
 assert.equal(bundledCollection({ ...options, query: 'no-such-poem' }).total, 0);
 assert.ok(bundledCollection({ ...options, theme: 'Memory' }).poems.every(p => p.theme === 'Memory'));
 assert.deepEqual(bundledCollection({ ...options, sort: 'desc' }).poems.map(p => p.slug), result.poems.map(p => p.slug).reverse());
});

test('configured collection responds without querying a slow database', async () => {
 const { load } = await import(moduleURL('src/routes/collection/+page.server.ts'));
 const result = await load({
  locals: { db: { query() { throw new Error('Initial render must not query the database'); } } },
  url: new URL('http://localhost/collection?q=river'),
  cookies: { get: () => 'en' }
 });
 assert.equal(result.refreshCollection, true);
 assert.equal(result.result, null);
 assert.equal(result.options.query, 'river');
});
