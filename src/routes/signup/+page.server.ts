import { fail, redirect } from '@sveltejs/kit';
import { Scrypt, generateIdFromEntropySize } from 'lucia';
import { PostgresError } from 'postgres';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import { credentialsSchema } from '$lib/schemas/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/');
};

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

		// Attempt the first registration on the site as owner; the partial
		// unique index (one_owner_idx) rejects a second owner row, and we
		// fall back to a plain user on that specific conflict. This avoids
		// a pre-check-then-insert race window.
		try {
			await db.insert(users).values({ id: userId, email, passwordHash, role: 'owner' });
		} catch (err) {
			if (err instanceof PostgresError && err.code === '23505') {
				if (err.constraint_name === 'users_email_idx') {
					return fail(400, { email, error: 'An account with that email already exists.' });
				}
				// one_owner_idx (or any other unique violation on this insert): fall back to user
				try {
					await db.insert(users).values({ id: userId, email, passwordHash, role: 'user' });
				} catch (retryErr) {
					if (retryErr instanceof PostgresError && retryErr.code === '23505') {
						return fail(400, { email, error: 'An account with that email already exists.' });
					}
					throw retryErr;
				}
			} else {
				throw err;
			}
		}

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(303, '/');
	}
};
