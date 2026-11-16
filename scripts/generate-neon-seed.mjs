import { readFileSync, writeFileSync } from 'node:fs';
const files = ['historical-poems', 'additional-poems', 'sample-poems'];
export function seedRows() {
 return files.flatMap(file => JSON.parse(readFileSync(new URL(`../src/lib/data/${file}.json`, import.meta.url), 'utf8'))).map(poem => {
  const { slug, title, khmer, author, authorKhmer, theme, description, lines, khmerLines, isSample, isExcerpt, yearLabel, form, ...details } = poem;
  return { slug, title, khmer, author, author_khmer: authorKhmer || '', theme, description, lines, khmer_lines: khmerLines, is_sample: Boolean(isSample), is_excerpt: Boolean(isExcerpt), year_label: yearLabel || '', form: form || '', details, status: 'published' };
 });
}
export function seedSQL() {
 // JSON avoids SQL quoting issues in multilingual text. A changing dollar tag
 // prevents any source content from closing the literal accidentally.
 const data = JSON.stringify(seedRows());
 let tag = '$aksara_seed$';
 while (data.includes(tag)) tag = tag.replace(/\$$/, '_$');
 return `-- Existing collection only. Safe to rerun: existing slugs are preserved.\nbegin;\ninsert into public.poems (slug,title,khmer,author,author_khmer,theme,description,lines,khmer_lines,is_sample,is_excerpt,year_label,form,details,status)\nselect slug,title,khmer,author,author_khmer,theme,description,lines,khmer_lines,is_sample,is_excerpt,year_label,form,details,status\nfrom jsonb_to_recordset(${tag}${data}${tag}::jsonb) as p(slug text,title text,khmer text,author text,author_khmer text,theme text,description text,lines text[],khmer_lines text[],is_sample boolean,is_excerpt boolean,year_label text,form text,details jsonb,status text)\non conflict (slug) do nothing;\ncommit;\n`;
}
if (process.argv[1] && new URL(process.argv[1], 'file:').pathname === new URL(import.meta.url).pathname) {
 const path = new URL('../neon/seed.sql', import.meta.url);
 writeFileSync(path, seedSQL());
 console.log(`Prepared ${seedRows().length} poems in neon/seed.sql.`);
}
