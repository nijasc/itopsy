ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "author_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_name" varchar(40);--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;