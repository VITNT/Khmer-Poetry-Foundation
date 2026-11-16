import { env } from '$env/dynamic/private';
import { Pool, types } from 'pg';

// Keep Postgres microseconds intact for optimistic concurrency checks.
types.setTypeParser(1184, value => value);
let pool: Pool | undefined;
export function getPool() {
 if (!env.DATABASE_URL) return null;
 return pool ??= new Pool({ connectionString: env.DATABASE_URL, max: 5, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
}
export type Database = ReturnType<typeof createDatabase>;
export function createDatabase(pool: Pool, userId: string | null) {
 return {
  async query(text: string, values: unknown[] = []) {
   const client = await pool.connect();
   try {
    await client.query('BEGIN');
    await client.query(userId ? 'SET LOCAL ROLE authenticated' : 'SET LOCAL ROLE anon');
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId || '']);
    const result = await client.query(text, values);
    await client.query('COMMIT');
    return result;
   } catch (cause) {
    await client.query('ROLLBACK');
    throw cause;
   } finally { client.release(); }
  }
 };
}
