import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { comments, users } from '$lib/server/db/schema';

export interface CommentRow {
	id: number;
	parentId: number | null;
	authorId: string;
	authorEmail: string;
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
			authorEmail: users.email,
			body: comments.body,
			createdAt: comments.createdAt,
			editedAt: comments.editedAt,
			isDeleted: comments.isDeleted
		})
		.from(comments)
		.innerJoin(users, eq(users.id, comments.authorId))
		.where(eq(comments.studyId, studyId))
		.orderBy(asc(comments.createdAt));

	const repliesByParent = new Map<number, CommentRow[]>();
	const topLevel: CommentRow[] = [];

	for (const row of rows) {
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
