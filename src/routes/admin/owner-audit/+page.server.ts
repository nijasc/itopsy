import type { PageServerLoad } from './$types';
import { listOwnerAuditLog } from '$lib/server/queries/audit';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async ({ locals }) => {
	requireRole(locals.user, 'owner');
	return { log: await listOwnerAuditLog() };
};
