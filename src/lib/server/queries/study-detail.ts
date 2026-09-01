import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { studies } from '$lib/server/db/schema';

export async function getStudyBySlug(slug: string) {
	const [study] = await db.select().from(studies).where(eq(studies.slug, slug)).limit(1);
	return study ?? null;
}
