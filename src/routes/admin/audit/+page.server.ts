import type { PageServerLoad } from './$types';
import { listAdminAuditLog } from '$lib/server/queries/audit';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async ({ locals }) => {
	requireRole(locals.user, 'admin');
	return { log: await listAdminAuditLog() };
};
