import * as t from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { severityEnum, statusEnum, languageEnum } from './enums';
import { users } from './users';

// The generated `search_vector` tsvector column + its GIN index are added
// via a raw-SQL custom migration (drizzle/0002_search_vector.sql) — Drizzle's
// schema DSL doesn't support generated tsvector columns.
export const studies = pgTable(
	'studies',
	{
		id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
		slug: t.varchar('slug', { length: 256 }).notNull(),
		title: t.varchar('title', { length: 256 }).notNull(),
		subject: t.varchar('subject', { length: 256 }).notNull(),
		dek: t.text('dek').notNull(),
		htmlContent: t.text('html_content').notNull(),
		tags: t.text('tags').array().notNull().default([]),
		severity: severityEnum('severity').notNull(),
		status: statusEnum('status').notNull().default('draft'),
		language: languageEnum('language').notNull().default('en'),
		authorId: t
			.text('author_id')
			.notNull()
			.references(() => users.id),
		likeCount: t.integer('like_count').notNull().default(0),
		createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: t.timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		t.uniqueIndex('studies_slug_idx').on(table.slug),
		t.index('studies_status_idx').on(table.status),
		t.index('studies_language_idx').on(table.language),
		t.index('studies_author_id_idx').on(table.authorId)
	]
);
