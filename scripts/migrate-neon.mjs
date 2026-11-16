import { readFileSync } from 'node:fs';
import { Pool } from 'pg';
import { getMigrations } from 'better-auth/db/migration';

if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL before running migrations.');
const database = new Pool({ connectionString: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL });
try {
 // Match the app's database-backed rate limiter as well as Better Auth core tables.
 const { runMigrations } = await getMigrations({ database, rateLimit: { enabled: true, storage: 'database' } });
 await runMigrations();
 const client = await database.connect();
 try {
  await client.query("select pg_advisory_lock(hashtext('aksara-migrations'))");
  await client.query('create table if not exists public.aksara_migrations (name text primary key)');
  const name = '202611080001_poems';
  const applied = await client.query('select name from public.aksara_migrations where name = $1', [name]);
  if (!applied.rowCount) {
   const sql = readFileSync(new URL(`../neon/migrations/${name}.sql`, import.meta.url), 'utf8');
   // Record the migration in the same transaction as its schema changes.
   await client.query(sql.replace(/commit;\s*$/, `insert into public.aksara_migrations values ('${name}');\ncommit;`));
  }
 } catch (cause) {
  await client.query('ROLLBACK');
  throw cause;
 } finally {
  await client.query("select pg_advisory_unlock(hashtext('aksara-migrations'))");
  client.release();
 }
 console.log('Neon schema is ready.');
} finally { await database.end(); }
