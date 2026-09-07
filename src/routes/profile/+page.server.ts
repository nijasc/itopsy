import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { Scrypt } from 'lucia';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { lucia, SESSION_COOKIE_PATH } from '$lib/server/auth';
import { publicName } from '$lib/server/display-name';
import { getLikedStudies, getUserComments, getUserAccount } from '$lib/server/queries/profile';
import { changePasswordSchema, displayNameSchema } from '$lib/schemas/profile';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');

	const [account, likedStudies, comments] = await Promise.all([
		getUserAccount(locals.user.id),
		getLikedStudies(locals.user.id),
		getUserComments(locals.user.id)
	]);

	return {
		account,
		publicName: account ? publicName(account) : null,
		likedStudies,
		comments
	};
};

export const actions: Actions = {
	changePassword: async ({ request, locals, cookies }) => {
		if (!locals.user) redirect(303, '/login');

		const formData = Object.fromEntries(await request.formData());
		const parsed = changePasswordSchema.safeParse(formData);
		if (!parsed.success) {
			return fail(400, { form: 'password', error: parsed.error.issues[0].message });
		}

		const [existing] = await db
			.select({ passwordHash: users.passwordHash })
			.from(users)
			.where(eq(users.id, locals.user.id))
			.limit(1);
		if (!existing) return fail(404, { form: 'password', error: 'Account not found.' });

		const valid = await new Scrypt().verify(existing.passwordHash, parsed.data.currentPassword);
		if (!valid) return fail(400, { form: 'password', error: 'Current password is incorrect.' });

		const newHash = await new Scrypt().hash(parsed.data.newPassword);
		await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, locals.user.id));

		// A password change evicts every other session (a hijacked session must
		// not outlive the fix), then re-issues one for this browser.
		await lucia.invalidateUserSessions(locals.user.id);
		const session = await lucia.createSession(locals.user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: SESSION_COOKIE_PATH,
			...sessionCookie.attributes
		});

		return { passwordChanged: true };
	},

	updateDisplayName: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');

		const formData = Object.fromEntries(await request.formData());
		const parsed = displayNameSchema.safeParse(formData);
		if (!parsed.success) {
			return fail(400, { form: 'name', error: parsed.error.issues[0].message });
		}

		await db
			.update(users)
			.set({ displayName: parsed.data.displayName })
			.where(eq(users.id, locals.user.id));

		return { nameUpdated: true };
	}
};
