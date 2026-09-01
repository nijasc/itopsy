import type { PageServerLoad } from './$types';
import {
	listGalleryStudies,
	getGalleryFacets,
	parseGalleryFilters
} from '$lib/server/queries/studies';

export const load: PageServerLoad = async ({ url }) => {
	const filters = parseGalleryFilters(url);

	const [{ studies, nextCursor }, facets] = await Promise.all([
		listGalleryStudies(filters),
		getGalleryFacets()
	]);

	return { studies, nextCursor, facets, filters };
};
