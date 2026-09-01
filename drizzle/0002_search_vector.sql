-- Generated full-text search column over title + subject + dek, plus a
-- GIN index, used by the gallery's search filter via websearch_to_tsquery.
ALTER TABLE studies ADD COLUMN search_vector tsvector
	GENERATED ALWAYS AS (
		setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
		setweight(to_tsvector('english', coalesce(subject, '')), 'B') ||
		setweight(to_tsvector('english', coalesce(dek, '')), 'C')
	) STORED;
--> statement-breakpoint
CREATE INDEX studies_search_vector_idx ON studies USING GIN (search_vector);
--> statement-breakpoint
-- reversible: ALTER TABLE studies DROP COLUMN search_vector; (index drops with it)
