import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { comments, users } from '$lib/server/db/schema';
import { publicName } from '$lib/server/display-name';

export interface CommentRow {
	id: number;
	parentId: number | null;
	/** Null once the author's account has been deleted. */
	authorId: string | null;
	/** The author's chosen display name or a stable pseudonym. Never their email. */
	authorName: string;
	body: string;
	createdAt: Date;
	editedAt: Date | null;
	isDeleted: boolean;
}

export interface CommentWithReplies extends CommentRow {
	replies: CommentRow[];
}

/** One level of replies: comments are fetched flat, then grouped by parentId in memory. */
export async function listStudyComments(studyId: number): Promise<CommentWithReplies[]> {
	const rows = await db
		.select({
			id: comments.id,
			parentId: comments.parentId,
			authorId: comments.authorId,
			authorDisplayName: users.displayName,
			body: comments.body,
			createdAt: comments.createdAt,
			editedAt: comments.editedAt,
			isDeleted: comments.isDeleted
		})
		.from(comments)
		.leftJoin(users, eq(users.id, comments.authorId))
		.where(eq(comments.studyId, studyId))
		.orderBy(asc(comments.createdAt));

	const repliesByParent = new Map<number, CommentRow[]>();
	const topLevel: CommentRow[] = [];

	for (const { authorDisplayName, ...rest } of rows) {
		const row: CommentRow = {
			...rest,
			authorName: publicName(
				rest.authorId ? { id: rest.authorId, displayName: authorDisplayName } : null
			)
		};
		if (row.parentId === null) {
			topLevel.push(row);
		} else {
			const list = repliesByParent.get(row.parentId) ?? [];
			list.push(row);
			repliesByParent.set(row.parentId, list);
		}
	}

	return topLevel.map((comment) => ({
		...comment,
		replies: repliesByParent.get(comment.id) ?? []
	}));
}
