import { desc, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { auditLogs } from '$lib/server/db/schema';
import { ADMIN_VISIBLE_ACTIONS } from '$lib/server/audit';

const LOG_PAGE_SIZE = 50;

/** Content-lifecycle actions only (create/edit/publish/unpublish) — no deletions or user management. */
export async function listAdminAuditLog() {
	return db
		.select()
		.from(auditLogs)
		.where(inArray(auditLogs.action, ADMIN_VISIBLE_ACTIONS))
		.orderBy(desc(auditLogs.createdAt))
		.limit(LOG_PAGE_SIZE);
}

/** The full, unrestricted audit trail — deletions and user management included. */
export async function listOwnerAuditLog() {
	return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(LOG_PAGE_SIZE);
}
