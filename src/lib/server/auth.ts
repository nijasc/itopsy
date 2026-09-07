import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { db } from './db';
import { sessions, users } from './db/schema';

/**
 * Session cookies must always be scoped to the whole site. Lucia's docs
 * suggest `path: '.'`, but SvelteKit resolves relative cookie paths against
 * the request path, so a session refreshed on /admin/studies/new would be
 * scoped to /admin/studies/ and leave a stale root cookie behind.
 */
export const SESSION_COOKIE_PATH = '/';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => ({
		email: attributes.email,
		role: attributes.role,
		displayName: attributes.displayName
	})
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			email: string;
			role: 'owner' | 'admin' | 'user';
			displayName: string | null;
		};
	}
}
