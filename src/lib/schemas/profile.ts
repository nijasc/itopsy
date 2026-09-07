import { z } from 'zod';

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required.'),
		newPassword: z.string().min(8, 'New password must be at least 8 characters.').max(256)
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: 'New password must be different from the current password.',
		path: ['newPassword']
	});

export const DISPLAY_NAME_MAX_LENGTH = 40;

/** Empty submits clear the name (back to the pseudonym); no '@' so a name can't masquerade as an email. */
export const displayNameSchema = z.object({
	displayName: z
		.string()
		.trim()
		.max(
			DISPLAY_NAME_MAX_LENGTH,
			`Public names are limited to ${DISPLAY_NAME_MAX_LENGTH} characters.`
		)
		.regex(/^[\p{L}\p{N} ._'-]*$/u, "Letters, numbers, spaces and . _ ' - only.")
		.transform((value) => (value === '' ? null : value))
		.refine((value) => value === null || value.length >= 2, {
			message: 'Public names need at least 2 characters.'
		})
});
