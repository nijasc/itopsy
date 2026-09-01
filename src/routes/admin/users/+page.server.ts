import { desc, eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { requireRole } from '$lib/server/authz';
import { logAudit } from '$lib/server/audit';

export const load: PageServerLoad = async ({ locals }) => {
	requireRole(locals.user, 'owner');
	const allUsers = await db
		.select({ id: users.id, email: users.email, role: users.role, createdAt: users.createdAt })
		.from(users)
		.orderBy(desc(users.createdAt));
	return { users: allUsers };
};

export const actions: Actions = {
	setRole: async ({ request, locals }) => {
		const owner = requireRole(locals.user, 'owner');
		const formData = await request.formData();
		const id = String(formData.get('id') ?? '');
		const role = formData.get('role');
		if (!id || (role !== 'admin' && role !== 'user')) {
			return fail(400, { error: 'Invalid request.' });
		}

		const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
		if (!target) error(404, 'User not found');

		// The owner can never be demoted/promoted away from 'owner' via this action.
		if (target.role === 'owner') {
			return fail(403, { error: 'The owner cannot be changed here.' });
		}

		await db.update(users).set({ role }).where(eq(users.id, id));
		await logAudit(
			owner,
			role === 'admin' ? 'user.promote' : 'user.demote',
			'user',
			id,
			`${role === 'admin' ? 'Promoted' : 'Demoted'} ${target.email} to ${role === 'admin' ? 'Staff Investigator' : 'Registered Whistleblower'}`
		);
	},

	// Owner-only, and cascades: deleting an account also deletes every study
	// and comment they authored (ON DELETE CASCADE at the schema level).
	deleteAccount: async ({ request, locals }) => {
		const owner = requireRole(locals.user, 'owner');
		const formData = await request.formData();
		const id = String(formData.get('id') ?? '');
		if (!id) return fail(400, { error: 'Invalid request.' });
		if (id === owner.id) return fail(403, { error: 'You cannot delete your own account.' });

		const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
		if (!target) error(404, 'User not found');
		if (target.role === 'owner') {
			return fail(403, { error: 'The owner account cannot be deleted.' });
		}

		await db.delete(users).where(eq(users.id, id));
		await logAudit(
			owner,
			'user.delete',
			'user',
			id,
			`Deleted account ${target.email} (and everything they authored)`
		);
	}
};
