-- Guarantees at most one 'owner' row can ever exist. The registration
-- insert attempts role = 'owner' first and falls back to 'user' on a
-- unique-violation catch, avoiding a pre-check-then-insert race window.
CREATE UNIQUE INDEX one_owner_idx ON users ((true)) WHERE role = 'owner';
--> statement-breakpoint
-- reversible: DROP INDEX one_owner_idx;
