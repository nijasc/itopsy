// Placeholder — real tables (users, studies, likes, comments, sessions)
// are designed in the planning pass.
import { pgTable, text } from 'drizzle-orm/pg-core';

export const placeholder = pgTable('placeholder', {
	id: text('id').primaryKey()
});
