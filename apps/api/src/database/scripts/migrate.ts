/**
 * Raw SQL migration runner.
 * Applies every .sql file in src/database/migrations (sorted by name) once,
 * tracking applied files in schema_migrations. Each file runs in a transaction.
 *
 * Usage: npm run migrate          (from repo root: npm run migrate)
 */
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { dbConfig } from '../data-source';

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function main(): Promise<void> {
  const cfg = dbConfig();
  const client = new Client(cfg);
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name        text PRIMARY KEY,
        applied_at  timestamptz NOT NULL DEFAULT now()
      )
    `);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const { rows } = await client.query('SELECT name FROM schema_migrations');
    const applied = new Set<string>(rows.map((r: { name: string }) => r.name));

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`↷ skip   ${file} (already applied)`);
        continue;
      }
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✔ apply  ${file}`);
        count++;
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
      }
    }

    console.log(count === 0 ? 'Database already up to date.' : `Applied ${count} migration(s).`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
