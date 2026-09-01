import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { studies } from '$lib/server/db/schema';
import { pgArray } from '$lib/server/db/pg-array';

export async function getStudyBySlug(slug: string) {
	const [study] = await db.select().from(studies).where(eq(studies.slug, slug)).limit(1);
	return study ?? null;
}

/**
 * A simple content-based recommender: rank other published studies by how
 * many tags they share with the current one, then by severity/language
 * match, then by popularity. No ML, just weighted SQL scoring — good enough
 * for a few dozen case studies.
 */
export async function getRecommendations(current: {
	id: number;
	tags: string[];
	severity: string;
	language: string;
}) {
	const sharedTagCount = sql<number>`cardinality(array(
		select unnest(${studies.tags}) intersect select unnest(${pgArray(current.tags)}::text[])
	))`.mapWith(Number);
	const score = sql<number>`(
		${sharedTagCount} * 3
		+ (case when ${studies.severity} = ${current.severity} then 1 else 0 end)
		+ (case when ${studies.language} = ${current.language} then 1 else 0 end)
	)`.mapWith(Number);

	return db
		.select({
			slug: studies.slug,
			title: studies.title,
			subject: studies.subject,
			severity: studies.severity,
			language: studies.language,
			likeCount: studies.likeCount,
			score
		})
		.from(studies)
		.where(and(eq(studies.status, 'published'), ne(studies.id, current.id)))
		.orderBy(desc(score), desc(studies.likeCount))
		.limit(4);
}
