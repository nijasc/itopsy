import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getStudyBySlug } from '$lib/server/queries/study-detail';
import { hasRole } from '$lib/server/authz';

export const load: PageServerLoad = async ({ params, locals }) => {
	const study = await getStudyBySlug(params.slug);

	// Drafts are invisible to anyone below admin, and to non-authoring admins
	// we still show them (admin+ can see all drafts per the spec). A 404 (not
	// a 403) is returned to anonymous/user requests so an unpublished study's
	// existence isn't leaked via the response code.
	const canSeeDraft =
		study && (hasRole(locals.user, 'admin') || study.authorId === locals.user?.id);
	if (!study || (study.status === 'draft' && !canSeeDraft)) {
		error(404, 'Study not found');
	}

	return { study };
};
