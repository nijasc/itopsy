import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { studies } from '$lib/server/db/schema';
import { studySchema } from '$lib/schemas/study';
import { generateUniqueSlug } from '$lib/server/slug';
import { requireRole } from '$lib/server/authz';
import { logAudit } from '$lib/server/audit';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = requireRole(locals.user, 'admin');
		const formData = Object.fromEntries(await request.formData());
		const parsed = studySchema.safeParse(formData);
		if (!parsed.success) {
			return fail(400, { values: formData, error: parsed.error.issues[0].message });
		}

		const slug = await generateUniqueSlug(parsed.data.title);
		const [study] = await db
			.insert(studies)
			.values({ ...parsed.data, slug, authorId: user.id })
			.returning();

		await logAudit(user, 'study.create', 'study', study.id, `Opened "${study.title}"`);

		redirect(303, `/admin/studies/${study.id}/edit`);
	}
};
