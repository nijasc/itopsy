import { and, desc, eq, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { likes, comments, studies, users } from '$lib/server/db/schema';

/** Only published studies: a like on a since-sealed study must not keep leaking its title. */
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
		.where(and(eq(likes.userId, userId), eq(studies.status, 'published')))
		.orderBy(desc(likes.createdAt));
}

/** Comments on published studies by default; admin views pass `includeUnpublished`. */
export async function getUserComments(
	userId: string,
	{ includeUnpublished = false }: { includeUnpublished?: boolean } = {}
) {
	const conditions: SQL[] = [eq(comments.authorId, userId)];
	if (!includeUnpublished) conditions.push(eq(studies.status, 'published'));

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
		.where(and(...conditions))
		.orderBy(desc(comments.createdAt))
		.limit(50);
}

export async function getUserAccount(userId: string) {
	const [account] = await db
		.select({
			id: users.id,
			email: users.email,
			displayName: users.displayName,
			role: users.role,
			createdAt: users.createdAt
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	return account ?? null;
}
