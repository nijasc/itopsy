import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listGalleryStudies, parseGalleryFilters } from '$lib/server/queries/studies';

/** Backs the gallery's "load more" — returns the next page for the same filters. */
export const GET: RequestHandler = async ({ url }) => {
	const result = await listGalleryStudies(parseGalleryFilters(url));
	return json(result);
};
