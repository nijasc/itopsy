import type { PageServerLoad } from './$types';
import {
	SORTS,
	listGalleryStudies,
	getGalleryFacets,
	type Sort
} from '$lib/server/queries/studies';

const SEVERITIES = ['mild', 'medium', 'savage'] as const;

export const load: PageServerLoad = async ({ url }) => {
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

	const [{ studies, nextCursor }, facets] = await Promise.all([
		listGalleryStudies({ tags, severity, search, sort, cursor }),
		getGalleryFacets()
	]);

	return { studies, nextCursor, facets, filters: { tags, severity, search, sort } };
};
