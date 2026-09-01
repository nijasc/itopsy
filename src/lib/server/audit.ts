import { db } from '$lib/server/db';
import { auditLogs } from '$lib/server/db/schema';
import type { User } from 'lucia';

export type AuditAction =
	| 'study.create'
	| 'study.edit'
	| 'study.publish'
	| 'study.unpublish'
	| 'study.delete'
	| 'user.promote'
	| 'user.demote'
	| 'user.delete';

/** Admin-visible actions: ordinary content lifecycle events. */
export const ADMIN_VISIBLE_ACTIONS: AuditAction[] = [
	'study.create',
	'study.edit',
	'study.publish',
	'study.unpublish'
];

export async function logAudit(
	actor: User,
	action: AuditAction,
	targetType: string,
	targetId: string | number | null,
	summary: string
) {
	await db.insert(auditLogs).values({
		actorId: actor.id,
		actorEmail: actor.email,
		actorRole: actor.role,
		action,
		targetType,
		targetId: targetId === null ? null : String(targetId),
		summary
	});
}
