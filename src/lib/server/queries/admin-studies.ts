import { desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { studies, comments, users } from '$lib/server/db/schema';

export const PAGE_SIZE = 20;

export async function listAllStudiesForAdmin(page = 1) {
	const [rows, [{ count }]] = await Promise.all([
		db
			.select({
				id: studies.id,
				slug: studies.slug,
				title: studies.title,
				status: studies.status,
				severity: studies.severity,
				language: studies.language,
				likeCount: studies.likeCount,
				authorId: studies.authorId,
				authorEmail: users.email,
				commentCount: sql<number>`(
					select count(*) from ${comments}
					where ${comments.studyId} = ${studies.id} and ${comments.isDeleted} = false
				)`.mapWith(Number),
				createdAt: studies.createdAt,
				updatedAt: studies.updatedAt
			})
			.from(studies)
			.innerJoin(users, eq(users.id, studies.authorId))
			.orderBy(desc(studies.createdAt))
			.limit(PAGE_SIZE)
			.offset((page - 1) * PAGE_SIZE),
		db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(studies)
	]);

	return { studies: rows, total: count };
}

export async function getStudyById(id: number) {
	const [study] = await db.select().from(studies).where(eq(studies.id, id)).limit(1);
	return study ?? null;
}

export async function getStudiesAuthoredBy(userId: string) {
	return db
		.select({
			id: studies.id,
			slug: studies.slug,
			title: studies.title,
			status: studies.status,
			severity: studies.severity,
			likeCount: studies.likeCount,
			createdAt: studies.createdAt
		})
		.from(studies)
		.where(eq(studies.authorId, userId))
		.orderBy(desc(studies.createdAt));
}
