import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const moduleURL = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText).toString('base64');
const catalogURL = moduleURL(readFileSync(new URL('../src/lib/catalog.ts', import.meta.url), 'utf8'));
const { normalizeSearch, collectionOptions } = await import(catalogURL);
const validationURL = moduleURL(readFileSync(new URL('../src/lib/validation.ts', import.meta.url), 'utf8').replace("'./catalog'", JSON.stringify(catalogURL)));
const { validatePoem, safeNext } = await import(validationURL);
function form(overrides = {}) {
 const data = new FormData();
 for (const [key, value] of Object.entries({ title: '', khmer: 'កំណាព្យរបស់ខ្ញុំ', author: 'A poet', theme: 'Memory', khmerText: 'បន្ទាត់មួយ\r\n\r\nបន្ទាត់ពីរ', permission: 'yes', ...overrides })) data.set(key, value);
 return data;
}
test('Khmer-only submissions preserve stanza breaks and normalize line endings', () => {
 const result = validatePoem(form());
 assert.equal(result.message, '');
 assert.equal(result.values.khmerText, 'បន្ទាត់មួយ\n\nបន្ទាត់ពីរ');
});
test('empty poems, excessive combined text, invalid themes, and missing permission are rejected', () => {
 for (const override of [{ khmerText: '' }, { englishText: 'x'.repeat(50000) }, { theme: 'invented' }, { permission: '' }, { title: 'x'.repeat(201) }, { author: '' }]) assert.ok(validatePoem(form(override)).message);
});
test('redirects stay on this site', () => {
 assert.equal(safeNext('/submit'), '/submit');
 for (const value of ['https://evil.example', '//evil.example', '/\\evil.example', '/\n/evil.example', null]) assert.equal(safeNext(value), '/account');
});
test('search normalizes Khmer digits and paging parameters are bounded', () => {
 assert.equal(normalizeSearch('A\u200b ១៩២២'), 'a 1922');
 assert.equal(collectionOptions(new URLSearchParams('page=Infinity'), 'en').page, 1);
 assert.equal(collectionOptions(new URLSearchParams('page=-5'), 'en').page, 1);
 assert.equal(collectionOptions(new URLSearchParams('page=99999999'), 'km').page, 100000);
 assert.equal(collectionOptions(new URLSearchParams('q=' + 'x'.repeat(250)), 'en').query.length, 200);
});
