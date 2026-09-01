import { error } from '@sveltejs/kit';
import type { User } from 'lucia';

const ROLE_RANK = { user: 1, admin: 2, owner: 3 } as const;
type Role = keyof typeof ROLE_RANK;

/** Throws a SvelteKit 403 unless the current user's role meets or exceeds `minRole`. */
export function requireRole(user: User | null, minRole: Role): User {
	if (!user) error(403, 'You must be signed in to do that.');
	if (ROLE_RANK[user.role] < ROLE_RANK[minRole]) {
		error(403, 'You do not have permission to do that.');
	}
	return user;
}

export function hasRole(user: User | null, minRole: Role): boolean {
	if (!user) return false;
	return ROLE_RANK[user.role] >= ROLE_RANK[minRole];
}
