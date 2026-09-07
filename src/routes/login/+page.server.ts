import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { Scrypt } from 'lucia';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { lucia, SESSION_COOKIE_PATH } from '$lib/server/auth';
import { credentialsSchema } from '$lib/schemas/auth';

const scrypt = new Scrypt();

// Verified against when the email is unknown, so a miss costs the same time
// as a wrong password and response timing doesn't reveal which emails exist.
let decoyHash: Promise<string> | undefined;
const getDecoyHash = () => (decoyHash ??= scrypt.hash('no-such-account'));

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
				error: 'Invalid email or password.'
			});
		}
		const { email, password } = parsed.data;

		const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
		if (!existingUser) {
			await scrypt.verify(await getDecoyHash(), password);
			return fail(400, { email, error: 'Incorrect email or password.' });
		}

		const validPassword = await scrypt.verify(existingUser.passwordHash, password);
		if (!validPassword) {
			return fail(400, { email, error: 'Incorrect email or password.' });
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: SESSION_COOKIE_PATH,
			...sessionCookie.attributes
		});

		redirect(303, '/');
	}
};
