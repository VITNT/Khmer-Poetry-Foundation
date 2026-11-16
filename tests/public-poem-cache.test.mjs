import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moduleURL } from './load-server-module.mjs';
const { createPublicPoemCache } = await import(moduleURL('src/lib/server/public-poem-cache.ts'));

test('public cache shares concurrent reads and expires or invalidates them', async () => {
 let time = 0, reads = 0;
 const cache = createPublicPoemCache(30, 2, () => time);
 const load = async () => ++reads;
 assert.deepEqual(await Promise.all([cache.get('a', load), cache.get('a', load)]), [1, 1]);
 time = 30;
 assert.equal(await cache.get('a', load), 2);
 cache.clear();
 assert.equal(await cache.get('a', load), 3);
 await cache.get('b', load);
 await cache.get('c', load);
 assert.equal(await cache.get('a', load), 6);
});
test('failed reads are retried and old failures cannot evict newer entries', async () => {
 const cache = createPublicPoemCache();
 await assert.rejects(cache.get('a', async () => { throw new Error('offline'); }));
 assert.equal(await cache.get('a', async () => 'recovered'), 'recovered');
 let reject;
 const pending = cache.get('b', () => new Promise((_, fail) => { reject = fail; }));
 await Promise.resolve();
 cache.clear();
 await cache.get('b', async () => 'new');
 reject(new Error('old'));
 await assert.rejects(pending);
 assert.equal(await cache.get('b', async () => 'unexpected'), 'new');
});
