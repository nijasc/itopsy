import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lucia, SESSION_COOKIE_PATH } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (!locals.session) redirect(303, '/');

	await lucia.invalidateSession(locals.session.id);
	const sessionCookie = lucia.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: SESSION_COOKIE_PATH,
		...sessionCookie.attributes
	});

	redirect(303, '/');
};
