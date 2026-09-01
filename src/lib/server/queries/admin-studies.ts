import { desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { studies, comments } from '$lib/server/db/schema';

export async function listAllStudiesForAdmin() {
	return db
		.select({
			id: studies.id,
			slug: studies.slug,
			title: studies.title,
			status: studies.status,
			severity: studies.severity,
			language: studies.language,
			likeCount: studies.likeCount,
			commentCount: sql<number>`(
				select count(*) from ${comments}
				where ${comments.studyId} = ${studies.id} and ${comments.isDeleted} = false
			)`.mapWith(Number),
			createdAt: studies.createdAt,
			updatedAt: studies.updatedAt
		})
		.from(studies)
		.orderBy(desc(studies.createdAt));
}

export async function getStudyById(id: number) {
	const [study] = await db.select().from(studies).where(eq(studies.id, id)).limit(1);
	return study ?? null;
}
