import * as t from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { users } from './users';

// actorEmail/actorRole are snapshots taken at the time of the action, so the
// log entry stays meaningful even after the actor's account is edited or
// deleted (actorId is nullable + ON DELETE SET NULL for that reason).
export const auditLogs = pgTable(
	'audit_logs',
	{
		id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
		actorId: t.text('actor_id').references(() => users.id, { onDelete: 'set null' }),
		actorEmail: t.varchar('actor_email', { length: 256 }).notNull(),
		actorRole: t.varchar('actor_role', { length: 32 }).notNull(),
		action: t.varchar('action', { length: 64 }).notNull(),
		targetType: t.varchar('target_type', { length: 32 }).notNull(),
		targetId: t.varchar('target_id', { length: 64 }),
		summary: t.text('summary').notNull(),
		createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		t.index('audit_logs_created_at_idx').on(table.createdAt),
		t.index('audit_logs_action_idx').on(table.action)
	]
);
