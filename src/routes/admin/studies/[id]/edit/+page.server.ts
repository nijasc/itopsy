import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { studies } from '$lib/server/db/schema';
import { getStudyById } from '$lib/server/queries/admin-studies';
import { studySchema } from '$lib/schemas/study';
import { generateUniqueSlug } from '$lib/server/slug';
import { requireRole, hasRole } from '$lib/server/authz';
import { logAudit } from '$lib/server/audit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404, 'Study not found');

	const study = await getStudyById(id);
	if (!study) error(404, 'Study not found');

	// Admins may only edit their own cases; the owner can edit any of them.
	if (!hasRole(locals.user, 'owner') && study.authorId !== locals.user?.id) {
		error(403, 'You can only re-examine cases you opened yourself.');
	}

	return { study };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const user = requireRole(locals.user, 'admin');
		const id = Number(params.id);
		if (!Number.isInteger(id)) return fail(400, { error: 'Invalid study.' });

		const existing = await getStudyById(id);
		if (!existing) error(404, 'Study not found');

		if (user.role !== 'owner' && existing.authorId !== user.id) {
			error(403, 'You can only re-examine cases you opened yourself.');
		}

		const formData = Object.fromEntries(await request.formData());
		const parsed = studySchema.safeParse(formData);
		if (!parsed.success) {
			return fail(400, { values: formData, error: parsed.error.issues[0].message });
		}

		const slug =
			parsed.data.title === existing.title
				? existing.slug
				: await generateUniqueSlug(parsed.data.title, id);

		await db
			.update(studies)
			.set({ ...parsed.data, slug, updatedAt: new Date() })
			.where(eq(studies.id, id));

		await logAudit(user, 'study.edit', 'study', id, `Amended "${parsed.data.title}"`);

		redirect(303, `/admin/studies/${id}/edit`);
	}
};
