import { sql } from 'drizzle-orm';

/**
 * Builds a Postgres `ARRAY[...]` literal from individually-bound parameters.
 * Drizzle's `sql` tag does NOT turn a JS array embedded as `${arr}` into a
 * Postgres array parameter — it sends it as a single flattened value, which
 * fails with "malformed array literal" against both postgres-js and neon-http.
 */
export function pgArray(values: string[]) {
	return sql`ARRAY[${sql.join(
		values.map((v) => sql`${v}`),
		sql`, `
	)}]`;
}
