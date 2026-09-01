import { relations } from 'drizzle-orm';
import { users, sessions } from './users';
import { studies } from './studies';
import { likes } from './likes';
import { comments } from './comments';

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	studies: many(studies),
	likes: many(likes),
	comments: many(comments)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const studiesRelations = relations(studies, ({ one, many }) => ({
	author: one(users, {
		fields: [studies.authorId],
		references: [users.id]
	}),
	likes: many(likes),
	comments: many(comments)
}));

export const likesRelations = relations(likes, ({ one }) => ({
	user: one(users, {
		fields: [likes.userId],
		references: [users.id]
	}),
	study: one(studies, {
		fields: [likes.studyId],
		references: [studies.id]
	})
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
	study: one(studies, {
		fields: [comments.studyId],
		references: [studies.id]
	}),
	author: one(users, {
		fields: [comments.authorId],
		references: [users.id]
	}),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: 'replies'
	}),
	replies: many(comments, { relationName: 'replies' })
}));
