import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { Scrypt } from 'lucia';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { getLikedStudies, getUserComments, getUserAccount } from '$lib/server/queries/profile';
import { changePasswordSchema } from '$lib/schemas/profile';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');

	const [account, likedStudies, comments] = await Promise.all([
		getUserAccount(locals.user.id),
		getLikedStudies(locals.user.id),
		getUserComments(locals.user.id)
	]);

	return { account, likedStudies, comments };
};

export const actions: Actions = {
	changePassword: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');

		const formData = Object.fromEntries(await request.formData());
		const parsed = changePasswordSchema.safeParse(formData);
		if (!parsed.success) {
			return fail(400, { error: parsed.error.issues[0].message });
		}

		const [existing] = await db
			.select({ passwordHash: users.passwordHash })
			.from(users)
			.where(eq(users.id, locals.user.id))
			.limit(1);
		if (!existing) return fail(404, { error: 'Account not found.' });

		const valid = await new Scrypt().verify(existing.passwordHash, parsed.data.currentPassword);
		if (!valid) return fail(400, { error: 'Current password is incorrect.' });

		const newHash = await new Scrypt().hash(parsed.data.newPassword);
		await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, locals.user.id));

		return { success: true };
	}
};
