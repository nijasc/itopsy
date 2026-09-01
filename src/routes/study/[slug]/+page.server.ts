import { and, eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { likes, comments } from '$lib/server/db/schema';
import { getStudyBySlug } from '$lib/server/queries/study-detail';
import { listStudyComments } from '$lib/server/queries/comments';
import { requireRole, hasRole } from '$lib/server/authz';
import { commentBodySchema, COMMENT_EDIT_WINDOW_MS } from '$lib/schemas/comment';

export const load: PageServerLoad = async ({ params, locals }) => {
	const study = await getStudyBySlug(params.slug);

	// Drafts are invisible to anyone below admin, and to non-authoring admins
	// we still show them (admin+ can see all drafts per the spec). A 404 (not
	// a 403) is returned to anonymous/user requests so an unpublished study's
	// existence isn't leaked via the response code.
	const canSeeDraft =
		study && (hasRole(locals.user, 'admin') || study.authorId === locals.user?.id);
	if (!study || (study.status === 'draft' && !canSeeDraft)) {
		error(404, 'Study not found');
	}

	const [studyComments, liked] = await Promise.all([
		listStudyComments(study.id),
		locals.user
			? db
					.select({ userId: likes.userId })
					.from(likes)
					.where(and(eq(likes.userId, locals.user.id), eq(likes.studyId, study.id)))
					.limit(1)
					.then((rows) => rows.length > 0)
			: Promise.resolve(false)
	]);

	return { study, comments: studyComments, liked };
};

export const actions: Actions = {
	like: async ({ locals, params }) => {
		const user = requireRole(locals.user, 'user');
		const study = await getStudyBySlug(params.slug);
		if (!study) error(404, 'Study not found');

		const [existing] = await db
			.select({ userId: likes.userId })
			.from(likes)
			.where(and(eq(likes.userId, user.id), eq(likes.studyId, study.id)))
			.limit(1);

		if (existing) {
			await db.delete(likes).where(and(eq(likes.userId, user.id), eq(likes.studyId, study.id)));
		} else {
			await db.insert(likes).values({ userId: user.id, studyId: study.id });
		}
	},

	comment: async ({ request, locals, params }) => {
		const user = requireRole(locals.user, 'user');
		const study = await getStudyBySlug(params.slug);
		if (!study) error(404, 'Study not found');

		const formData = Object.fromEntries(await request.formData());
		const parsed = commentBodySchema.safeParse(formData);
		if (!parsed.success) {
			return fail(400, { error: parsed.error.issues[0].message });
		}

		const parentIdRaw = formData.parentId;
		let parentId: number | null = null;
		if (typeof parentIdRaw === 'string' && parentIdRaw.trim()) {
			parentId = Number(parentIdRaw);
			if (!Number.isInteger(parentId)) return fail(400, { error: 'Invalid reply target.' });
			// One level of replies only: replying to a reply attaches to its parent instead.
			const [parentComment] = await db
				.select({ parentId: comments.parentId })
				.from(comments)
				.where(and(eq(comments.id, parentId), eq(comments.studyId, study.id)))
				.limit(1);
			if (!parentComment) return fail(400, { error: 'That comment no longer exists.' });
			if (parentComment.parentId !== null) parentId = parentComment.parentId;
		}

		await db.insert(comments).values({
			studyId: study.id,
			authorId: user.id,
			parentId,
			body: parsed.data.body
		});
	},

	editComment: async ({ request, locals, params }) => {
		const user = requireRole(locals.user, 'user');
		const study = await getStudyBySlug(params.slug);
		if (!study) error(404, 'Study not found');

		const formData = Object.fromEntries(await request.formData());
		const commentId = Number(formData.commentId);
		if (!Number.isInteger(commentId)) return fail(400, { error: 'Invalid comment.' });

		const parsed = commentBodySchema.safeParse(formData);
		if (!parsed.success) return fail(400, { error: parsed.error.issues[0].message });

		const [existing] = await db
			.select()
			.from(comments)
			.where(and(eq(comments.id, commentId), eq(comments.studyId, study.id)))
			.limit(1);
		if (!existing || existing.isDeleted) return fail(404, { error: 'Comment not found.' });
		if (existing.authorId !== user.id) error(403, 'You can only edit your own comments.');
		if (Date.now() - existing.createdAt.getTime() > COMMENT_EDIT_WINDOW_MS) {
			return fail(403, { error: 'The 15-minute edit window for this comment has passed.' });
		}

		await db
			.update(comments)
			.set({ body: parsed.data.body, editedAt: new Date() })
			.where(eq(comments.id, commentId));
	},

	deleteComment: async ({ request, locals, params }) => {
		const user = requireRole(locals.user, 'user');
		const study = await getStudyBySlug(params.slug);
		if (!study) error(404, 'Study not found');

		const formData = Object.fromEntries(await request.formData());
		const commentId = Number(formData.commentId);
		if (!Number.isInteger(commentId)) return fail(400, { error: 'Invalid comment.' });

		const [existing] = await db
			.select()
			.from(comments)
			.where(and(eq(comments.id, commentId), eq(comments.studyId, study.id)))
			.limit(1);
		if (!existing) return fail(404, { error: 'Comment not found.' });

		// Authors can delete their own comment any time; admin+ can moderate any comment.
		const isModerator = hasRole(locals.user, 'admin');
		if (existing.authorId !== user.id && !isModerator) {
			error(403, 'You do not have permission to delete this comment.');
		}

		await db.update(comments).set({ isDeleted: true }).where(eq(comments.id, commentId));
	}
};
