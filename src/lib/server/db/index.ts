import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Uses Neon's HTTP driver (HTTPS, not the raw Postgres wire protocol) —
// this network blocks outbound port 5432, so a plain postgres.js/TCP
// connection can't reach the database. Revert to postgres-js/postgres if
// deploying somewhere without that restriction.
export const db = drizzle(env.DATABASE_URL, { schema });
