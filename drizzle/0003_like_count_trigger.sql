-- Keeps studies.like_count in sync with the likes table on insert/delete,
-- so the denormalized counter can't drift under concurrent requests or
-- app crashes mid-request.
CREATE FUNCTION likes_adjust_study_like_count() RETURNS trigger AS $$
BEGIN
	IF (TG_OP = 'INSERT') THEN
		UPDATE studies SET like_count = like_count + 1 WHERE id = NEW.study_id;
		RETURN NEW;
	ELSIF (TG_OP = 'DELETE') THEN
		UPDATE studies SET like_count = like_count - 1 WHERE id = OLD.study_id;
		RETURN OLD;
	END IF;
	RETURN NULL;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER likes_after_insert
	AFTER INSERT ON likes
	FOR EACH ROW EXECUTE FUNCTION likes_adjust_study_like_count();
--> statement-breakpoint
CREATE TRIGGER likes_after_delete
	AFTER DELETE ON likes
	FOR EACH ROW EXECUTE FUNCTION likes_adjust_study_like_count();
--> statement-breakpoint
-- reversible:
-- DROP TRIGGER likes_after_insert ON likes;
-- DROP TRIGGER likes_after_delete ON likes;
-- DROP FUNCTION likes_adjust_study_like_count();
