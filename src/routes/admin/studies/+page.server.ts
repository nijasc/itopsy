import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { studies } from '$lib/server/db/schema';
import { listAllStudiesForAdmin, PAGE_SIZE } from '$lib/server/queries/admin-studies';
import { requireRole } from '$lib/server/authz';
import { logAudit } from '$lib/server/audit';

export const load: PageServerLoad = async ({ url }) => {
	const pageParam = Number(url.searchParams.get('page'));
	const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
	const { studies: rows, total } = await listAllStudiesForAdmin(page);
	return { studies: rows, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
};

export const actions: Actions = {
	setStatus: async ({ request, locals }) => {
		const user = requireRole(locals.user, 'admin');
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const status = formData.get('status');
		if (!Number.isInteger(id) || (status !== 'draft' && status !== 'published')) {
			return fail(400, { error: 'Invalid request.' });
		}

		const [existing] = await db.select().from(studies).where(eq(studies.id, id)).limit(1);
		if (!existing) return fail(404, { error: 'Study not found.' });

		await db.update(studies).set({ status, updatedAt: new Date() }).where(eq(studies.id, id));
		await logAudit(
			user,
			status === 'published' ? 'study.publish' : 'study.unpublish',
			'study',
			id,
			`${status === 'published' ? 'Published' : 'Sealed'} "${existing.title}"`
		);
	},

	// Only the owner may permanently destroy a case file. Admins can create
	// and edit, but never delete — matches the spec's role hierarchy.
	delete: async ({ request, locals }) => {
		const user = requireRole(locals.user, 'owner');
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'Invalid request.' });

		const [existing] = await db.select().from(studies).where(eq(studies.id, id)).limit(1);
		if (!existing) return fail(404, { error: 'Study not found.' });

		await db.delete(studies).where(eq(studies.id, id));
		await logAudit(user, 'study.delete', 'study', id, `Destroyed "${existing.title}"`);
	}
};
