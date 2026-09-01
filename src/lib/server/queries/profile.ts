import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { likes, comments, studies, users } from '$lib/server/db/schema';

export async function getLikedStudies(userId: string) {
	return db
		.select({
			slug: studies.slug,
			title: studies.title,
			subject: studies.subject,
			severity: studies.severity,
			likeCount: studies.likeCount,
			likedAt: likes.createdAt
		})
		.from(likes)
		.innerJoin(studies, eq(studies.id, likes.studyId))
		.where(eq(likes.userId, userId))
		.orderBy(desc(likes.createdAt));
}

export async function getUserComments(userId: string) {
	return db
		.select({
			id: comments.id,
			body: comments.body,
			createdAt: comments.createdAt,
			isDeleted: comments.isDeleted,
			studySlug: studies.slug,
			studyTitle: studies.title
		})
		.from(comments)
		.innerJoin(studies, eq(studies.id, comments.studyId))
		.where(eq(comments.authorId, userId))
		.orderBy(desc(comments.createdAt))
		.limit(50);
}

export async function getUserAccount(userId: string) {
	const [account] = await db
		.select({ email: users.email, role: users.role, createdAt: users.createdAt })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	return account ?? null;
}
