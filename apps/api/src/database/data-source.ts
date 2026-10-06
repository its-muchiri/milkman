import { DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

// Load the repo-root .env for standalone scripts (migrate/seed) and Nest.
const envCandidates = [
  path.resolve(__dirname, '../../../.env'), // apps/api/src/database -> repo root
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
];
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config({ path: p });
    break;
  }
}

export function dbConfig() {
  return {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'milkman',
    password: process.env.DATABASE_PASSWORD ?? 'milkman_dev',
    database: process.env.DATABASE_NAME ?? 'milkman',
  };
}

/** Shared by the Nest TypeOrmModule and the migrate/seed scripts. */
export function buildDataSourceOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    ...dbConfig(),
    entities: [path.join(__dirname, 'entities/*.entity.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
    migrationsRun: false,
    synchronize: false,          // schema is owned by the raw SQL migrations
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  };
}
