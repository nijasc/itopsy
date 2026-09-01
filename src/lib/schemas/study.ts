import { z } from 'zod';

export const severityValues = ['mild', 'medium', 'savage'] as const;
export const statusValues = ['draft', 'published'] as const;
export const languageValues = ['en', 'de'] as const;

export const studySchema = z.object({
	title: z.string().trim().min(1, 'Title is required.').max(256),
	subject: z.string().trim().min(1, 'Subject is required.').max(256),
	dek: z.string().trim().min(1, 'Dek is required.'),
	htmlContent: z.string().min(1, 'HTML content is required.'),
	tags: z
		.string()
		.optional()
		.transform((raw) =>
			(raw ?? '')
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)
		),
	severity: z.enum(severityValues),
	status: z.enum(statusValues),
	language: z.enum(languageValues)
});
