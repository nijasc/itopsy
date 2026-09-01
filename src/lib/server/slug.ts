import { eq } from 'drizzle-orm';
import { db } from './db';
import { studies } from './db/schema';

function slugify(title: string): string {
	return (
		title
			.toLowerCase()
			.normalize('NFKD')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 200) || 'study'
	);
}

/** Generates a unique slug from a title, appending a short random suffix on collision. */
export async function generateUniqueSlug(title: string, excludeStudyId?: number): Promise<string> {
	const base = slugify(title);
	let candidate = base;
	let attempt = 0;

	while (true) {
		const [existing] = await db
			.select({ id: studies.id })
			.from(studies)
			.where(eq(studies.slug, candidate))
			.limit(1);

		if (!existing || existing.id === excludeStudyId) return candidate;

		attempt += 1;
		candidate = `${base}-${Math.random()
			.toString(36)
			.slice(2, 2 + 4)}`;
		if (attempt > 10) throw new Error('Could not generate a unique slug');
	}
}
