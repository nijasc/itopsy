import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getUserAccount, getUserComments } from '$lib/server/queries/profile';
import { getStudiesAuthoredBy } from '$lib/server/queries/admin-studies';
import { requireRole, hasRole } from '$lib/server/authz';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { logAudit } from '$lib/server/audit';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireRole(locals.user, 'admin');

	const account = await getUserAccount(params.id);
	if (!account) error(404, 'Account not found');

	const [authoredStudies, comments] = await Promise.all([
		getStudiesAuthoredBy(params.id),
		getUserComments(params.id)
	]);

	return {
		account,
		authoredStudies,
		comments,
		isOwnerViewer: hasRole(locals.user, 'owner')
	};
};

export const actions: Actions = {
	setRole: async ({ request, locals, params }) => {
		const owner = requireRole(locals.user, 'owner');
		const formData = await request.formData();
		const role = formData.get('role');
		if (role !== 'admin' && role !== 'user') return fail(400, { error: 'Invalid request.' });

		const [target] = await db.select().from(users).where(eq(users.id, params.id)).limit(1);
		if (!target) error(404, 'Account not found');
		if (target.role === 'owner') {
			return fail(403, { error: 'The owner cannot be changed here.' });
		}

		await db.update(users).set({ role }).where(eq(users.id, params.id));
		await logAudit(
			owner,
			role === 'admin' ? 'user.promote' : 'user.demote',
			'user',
			params.id,
			`${role === 'admin' ? 'Promoted' : 'Demoted'} ${target.email} to ${role === 'admin' ? 'Staff Investigator' : 'Registered Whistleblower'}`
		);
	},

	deleteAccount: async ({ locals, params }) => {
		const owner = requireRole(locals.user, 'owner');
		if (params.id === owner.id) return fail(403, { error: 'You cannot delete your own account.' });

		const [target] = await db.select().from(users).where(eq(users.id, params.id)).limit(1);
		if (!target) error(404, 'Account not found');
		if (target.role === 'owner') {
			return fail(403, { error: 'The owner account cannot be deleted.' });
		}

		await db.delete(users).where(eq(users.id, params.id));
		await logAudit(
			owner,
			'user.delete',
			'user',
			params.id,
			`Deleted account ${target.email} (and everything they authored)`
		);

		redirect(303, '/admin/users');
	}
};
