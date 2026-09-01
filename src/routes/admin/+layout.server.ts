import type { LayoutServerLoad } from './$types';
import { requireRole } from '$lib/server/authz';

export const load: LayoutServerLoad = async ({ locals }) => {
	requireRole(locals.user, 'admin');
};
