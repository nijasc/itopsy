import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { studies } from '$lib/server/db/schema';
import { listAllStudiesForAdmin } from '$lib/server/queries/admin-studies';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async () => {
	return { studies: await listAllStudiesForAdmin() };
};

export const actions: Actions = {
	setStatus: async ({ request, locals }) => {
		requireRole(locals.user, 'admin');
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const status = formData.get('status');
		if (!Number.isInteger(id) || (status !== 'draft' && status !== 'published')) {
			return fail(400, { error: 'Invalid request.' });
		}
		await db.update(studies).set({ status, updatedAt: new Date() }).where(eq(studies.id, id));
	},

	delete: async ({ request, locals }) => {
		requireRole(locals.user, 'admin');
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'Invalid request.' });
		await db.delete(studies).where(eq(studies.id, id));
	}
};
