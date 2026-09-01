import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['owner', 'admin', 'user']);
export const severityEnum = pgEnum('severity', ['mild', 'medium', 'savage']);
export const statusEnum = pgEnum('status', ['draft', 'published']);
