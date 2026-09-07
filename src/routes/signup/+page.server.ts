import { fail, redirect } from '@sveltejs/kit';
import { Scrypt, generateIdFromEntropySize } from 'lucia';
import { NeonDbError } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { lucia, SESSION_COOKIE_PATH } from '$lib/server/auth';
import { credentialsSchema } from '$lib/schemas/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/');
};

function isUniqueViolation(err: unknown): NeonDbError | null {
	const cause = err instanceof Error ? (err.cause ?? err) : err;
	return cause instanceof NeonDbError && cause.code === '23505' ? cause : null;
}

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsed = credentialsSchema.safeParse(formData);
		if (!parsed.success) {
			return fail(400, {
				email: String(formData.email ?? ''),
				error: 'Invalid email or password (min 8 characters).'
			});
		}
		const { email, password } = parsed.data;

		const passwordHash = await new Scrypt().hash(password);
		const userId = generateIdFromEntropySize(10);

		// Owner bootstrap is gated on OWNER_EMAIL: only that address is offered
		// the owner role, and only while no owner exists. The partial unique
		// index (one_owner_idx) still guarantees at most one owner row, so two
		// simultaneous signups with the same address can't both win, and the
		// loser falls back to a plain user. Without OWNER_EMAIL nobody can claim
		// the site through the signup form.
		const ownerEmail = env.OWNER_EMAIL?.trim().toLowerCase();
		const wantsOwner = Boolean(ownerEmail) && email === ownerEmail;

		try {
			await db
				.insert(users)
				.values({ id: userId, email, passwordHash, role: wantsOwner ? 'owner' : 'user' });
		} catch (err) {
			const violation = isUniqueViolation(err);
			if (!violation) throw err;
			if (violation.constraint === 'users_email_idx') {
				return fail(400, { email, error: 'An account with that email already exists.' });
			}
			if (!wantsOwner) throw err;

			// one_owner_idx: an owner already exists, so register as a plain user.
			try {
				await db.insert(users).values({ id: userId, email, passwordHash, role: 'user' });
			} catch (retryErr) {
				if (isUniqueViolation(retryErr)) {
					return fail(400, { email, error: 'An account with that email already exists.' });
				}
				throw retryErr;
			}
		}

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: SESSION_COOKIE_PATH,
			...sessionCookie.attributes
		});

		redirect(303, '/');
	}
};
