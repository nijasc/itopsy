import { and, desc, eq, sql, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { studies, comments } from '$lib/server/db/schema';

/**
 * Builds a Postgres `ARRAY[...]` literal from individually-bound parameters.
 * Drizzle's `sql` tag does NOT turn a JS array embedded as `${arr}` into a
 * Postgres array parameter — it sends it as a single flattened value, which
 * fails with "malformed array literal" against both postgres-js and neon-http.
 */
function pgArray(values: string[]) {
	return sql`ARRAY[${sql.join(
		values.map((v) => sql`${v}`),
		sql`, `
	)}]`;
}

export const SORTS = ['newest', 'most-liked', 'most-discussed'] as const;
export type Sort = (typeof SORTS)[number];

export const PAGE_SIZE = 24;

export const LANGUAGES = ['en', 'de', 'all'] as const;
export type LanguageFilter = (typeof LANGUAGES)[number];

export interface GalleryFilters {
	tags: string[];
	severity: string[];
	language: LanguageFilter;
	search: string;
	sort: Sort;
	/** Opaque cursor from the previous page's `nextCursor`. */
	cursor: string | null;
}

const SEVERITIES = ['mild', 'medium', 'savage'] as const;

/** Shared query-param parsing for the gallery load function and its "load more" API route. */
export function parseGalleryFilters(url: URL): GalleryFilters {
	const tags = url.searchParams.getAll('tag');
	const severity = url.searchParams
		.getAll('severity')
		.filter((s) => (SEVERITIES as readonly string[]).includes(s));
	const languageParam = url.searchParams.get('lang');
	const language: LanguageFilter = (LANGUAGES as readonly string[]).includes(languageParam ?? '')
		? (languageParam as LanguageFilter)
		: 'en';
	const search = url.searchParams.get('q') ?? '';
	const sortParam = url.searchParams.get('sort');
	const sort: Sort = (SORTS as readonly string[]).includes(sortParam ?? '')
		? (sortParam as Sort)
		: 'newest';
	const cursor = url.searchParams.get('cursor');

	return { tags, severity, language, search, sort, cursor };
}

interface Cursor {
	/** createdAt (ms since epoch) for `newest`, likeCount for `most-liked`, commentCount for `most-discussed`. */
	value: number;
	id: number;
}

function encodeCursor(cursor: Cursor): string {
	return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

function decodeCursor(raw: string | null): Cursor | null {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
		if (typeof parsed?.value === 'number' && typeof parsed?.id === 'number') return parsed;
	} catch {
		// ignore malformed cursor, treat as first page
	}
	return null;
}

const commentCounts = db
	.select({
		studyId: comments.studyId,
		count: sql<number>`count(*)`.mapWith(Number).as('comment_count')
	})
	.from(comments)
	.where(eq(comments.isDeleted, false))
	.groupBy(comments.studyId)
	.as('comment_counts');

export async function listGalleryStudies(filters: GalleryFilters) {
	const conditions: SQL[] = [eq(studies.status, 'published')];

	if (filters.tags.length > 0) {
		conditions.push(sql`${studies.tags} && ${pgArray(filters.tags)}`);
	}
	if (filters.severity.length > 0) {
		conditions.push(sql`${studies.severity} = ANY(${pgArray(filters.severity)}::severity[])`);
	}
	if (filters.language !== 'all') {
		conditions.push(eq(studies.language, filters.language));
	}
	if (filters.search.trim()) {
		conditions.push(
			sql`studies.search_vector @@ websearch_to_tsquery('english', ${filters.search.trim()})`
		);
	}

	const commentCountExpr = sql<number>`coalesce(${commentCounts.count}, 0)`.mapWith(Number);
	const sortExpr =
		filters.sort === 'most-liked'
			? studies.likeCount
			: filters.sort === 'most-discussed'
				? commentCountExpr
				: sql`extract(epoch from ${studies.createdAt})`;

	const cursor = decodeCursor(filters.cursor);
	if (cursor) {
		conditions.push(sql`(${sortExpr}, ${studies.id}) < (${cursor.value}, ${cursor.id})`);
	}

	const rows = await db
		.select({
			id: studies.id,
			slug: studies.slug,
			title: studies.title,
			subject: studies.subject,
			dek: studies.dek,
			htmlContent: studies.htmlContent,
			tags: studies.tags,
			severity: studies.severity,
			language: studies.language,
			likeCount: studies.likeCount,
			createdAt: studies.createdAt,
			commentCount: commentCountExpr
		})
		.from(studies)
		.leftJoin(commentCounts, eq(commentCounts.studyId, studies.id))
		.where(and(...conditions))
		.orderBy(desc(sortExpr), desc(studies.id))
		.limit(PAGE_SIZE + 1);

	const hasMore = rows.length > PAGE_SIZE;
	const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

	let nextCursor: string | null = null;
	if (hasMore) {
		const last = page[page.length - 1];
		const value =
			filters.sort === 'most-liked'
				? last.likeCount
				: filters.sort === 'most-discussed'
					? last.commentCount
					: Math.floor(last.createdAt.getTime() / 1000);
		nextCursor = encodeCursor({ value, id: last.id });
	}

	return { studies: page, nextCursor };
}

export interface Facets {
	tags: { tag: string; count: number }[];
	severities: { severity: string; count: number }[];
	languages: { language: string; count: number }[];
}

/** Global facet counts across all published studies (not narrowed by the currently-active filters). */
export async function getGalleryFacets(): Promise<Facets> {
	const [tagRows, severityRows, languageRows] = await Promise.all([
		db
			.select({
				tag: sql<string>`unnest(${studies.tags})`.as('tag'),
				count: sql<number>`count(*)`.mapWith(Number)
			})
			.from(studies)
			.where(eq(studies.status, 'published'))
			.groupBy(sql`1`)
			.orderBy(sql`2 desc`),
		db
			.select({
				severity: studies.severity,
				count: sql<number>`count(*)`.mapWith(Number)
			})
			.from(studies)
			.where(eq(studies.status, 'published'))
			.groupBy(studies.severity),
		db
			.select({
				language: studies.language,
				count: sql<number>`count(*)`.mapWith(Number)
			})
			.from(studies)
			.where(eq(studies.status, 'published'))
			.groupBy(studies.language)
	]);

	return { tags: tagRows, severities: severityRows, languages: languageRows };
}
