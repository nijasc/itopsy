import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { studies } from '$lib/server/db/schema';

function escapeXml(value: string) {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const GET: RequestHandler = async ({ url }) => {
	const publishedStudies = await db
		.select({ slug: studies.slug, updatedAt: studies.updatedAt })
		.from(studies)
		.where(eq(studies.status, 'published'));

	const urls = [
		{ loc: url.origin, lastmod: new Date(), priority: '1.0' },
		...publishedStudies.map((study) => ({
			loc: `${url.origin}/study/${study.slug}`,
			lastmod: study.updatedAt,
			priority: '0.8'
		}))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(entry) => `	<url>
		<loc>${escapeXml(entry.loc)}</loc>
		<lastmod>${entry.lastmod.toISOString()}</lastmod>
		<priority>${entry.priority}</priority>
	</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
