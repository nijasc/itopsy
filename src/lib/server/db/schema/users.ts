import * as t from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { roleEnum } from './enums';

// The partial unique index that guarantees at most one owner row
// (`one_owner_idx`, on `(true) WHERE role = 'owner'`) is created via a
// raw-SQL custom migration — Drizzle's schema DSL can't express an
// expression index, see drizzle/0001_owner_unique_index.sql.
export const users = pgTable(
	'users',
	{
		id: t.text('id').primaryKey(),
		email: t.varchar('email', { length: 256 }).notNull(),
		passwordHash: t.text('password_hash').notNull(),
		role: roleEnum('role').notNull().default('user'),
		createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [t.uniqueIndex('users_email_idx').on(table.email)]
);

export const sessions = pgTable('sessions', {
	id: t.text('id').primaryKey(),
	userId: t
		.text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: t.timestamp('expires_at', { withTimezone: true }).notNull()
});
