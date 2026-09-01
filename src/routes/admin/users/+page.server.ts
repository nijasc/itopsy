import { desc, eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { requireRole } from '$lib/server/authz';

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
		requireRole(locals.user, 'owner');
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
	}
};
