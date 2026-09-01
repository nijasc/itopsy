import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SORTS, listGalleryStudies, type Sort } from '$lib/server/queries/studies';

const SEVERITIES = ['mild', 'medium', 'savage'] as const;

/** Backs the gallery's "load more" — returns the next page for the same filters. */
export const GET: RequestHandler = async ({ url }) => {
	const tags = url.searchParams.getAll('tag');
	const severity = url.searchParams
		.getAll('severity')
		.filter((s) => (SEVERITIES as readonly string[]).includes(s));
	const search = url.searchParams.get('q') ?? '';
	const sortParam = url.searchParams.get('sort');
	const sort: Sort = (SORTS as readonly string[]).includes(sortParam ?? '')
		? (sortParam as Sort)
		: 'newest';
	const cursor = url.searchParams.get('cursor');

	const result = await listGalleryStudies({ tags, severity, search, sort, cursor });
	return json(result);
};
