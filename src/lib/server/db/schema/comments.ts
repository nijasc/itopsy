import * as t from 'drizzle-orm/pg-core';
import { pgTable, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { users } from './users';
import { studies } from './studies';

export const comments = pgTable(
	'comments',
	{
		id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
		studyId: t
			.integer('study_id')
			.notNull()
			.references(() => studies.id, { onDelete: 'cascade' }),
		authorId: t
			.text('author_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		parentId: t.integer('parent_id').references((): AnyPgColumn => comments.id, {
			onDelete: 'cascade'
		}),
		body: t.text('body').notNull(),
		createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		editedAt: t.timestamp('edited_at', { withTimezone: true }),
		isDeleted: t.boolean('is_deleted').notNull().default(false)
	},
	(table) => [
		t.index('comments_study_id_idx').on(table.studyId),
		t.index('comments_parent_id_idx').on(table.parentId)
	]
);
