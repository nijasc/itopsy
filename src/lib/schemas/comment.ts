import { z } from 'zod';

export const commentBodySchema = z.object({
	body: z.string().trim().min(1, 'Comment cannot be empty.').max(2000)
});

/** Authors can edit their own comment within this window of posting. */
export const COMMENT_EDIT_WINDOW_MS = 15 * 60 * 1000;
