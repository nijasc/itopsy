import { z } from 'zod';

export const severityValues = ['mild', 'medium', 'savage'] as const;
export const statusValues = ['draft', 'published'] as const;
export const languageValues = ['en', 'de'] as const;

// Upper bounds so a single study can't balloon the gallery payload or the
// database; the gallery ships the full HTML of a page of studies for thumbnails.
export const MAX_DEK_LENGTH = 1000;
export const MAX_HTML_LENGTH = 1_000_000;
export const MAX_TAGS = 20;
export const MAX_TAG_LENGTH = 40;

export const studySchema = z.object({
	title: z.string().trim().min(1, 'Title is required.').max(256),
	subject: z.string().trim().min(1, 'Subject is required.').max(256),
	dek: z
		.string()
		.trim()
		.min(1, 'Dek is required.')
		.max(MAX_DEK_LENGTH, `The dek is limited to ${MAX_DEK_LENGTH} characters.`),
	htmlContent: z
		.string()
		.min(1, 'HTML content is required.')
		.max(MAX_HTML_LENGTH, 'HTML content is limited to 1 MB.'),
	tags: z
		.string()
		.optional()
		.transform((raw) =>
			Array.from(
				new Set(
					(raw ?? '')
						.split(',')
						.map((t) => t.trim().toLowerCase())
						.filter(Boolean)
				)
			)
		)
		.pipe(
			z
				.array(
					z.string().max(MAX_TAG_LENGTH, `Tags are limited to ${MAX_TAG_LENGTH} characters each.`)
				)
				.max(MAX_TAGS, `A study can carry at most ${MAX_TAGS} tags.`)
		),
	severity: z.enum(severityValues),
	status: z.enum(statusValues),
	language: z.enum(languageValues)
});
