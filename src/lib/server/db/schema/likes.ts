import * as t from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { users } from './users';
import { studies } from './studies';

// A trigger on this table maintains `studies.like_count`, added via a
// raw-SQL custom migration (drizzle/0003_like_count_trigger.sql).
export const likes = pgTable(
	'likes',
	{
		userId: t
			.text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		studyId: t
			.integer('study_id')
			.notNull()
			.references(() => studies.id, { onDelete: 'cascade' }),
		createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		t.primaryKey({ columns: [table.userId, table.studyId] }),
		t.index('likes_study_id_idx').on(table.studyId)
	]
);
