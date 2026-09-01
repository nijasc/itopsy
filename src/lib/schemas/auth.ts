import { z } from 'zod';

export const credentialsSchema = z.object({
	email: z.string().trim().toLowerCase().email().max(256),
	password: z.string().min(8).max(256)
});
