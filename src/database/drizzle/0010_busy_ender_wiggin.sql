ALTER TABLE "questions" ADD COLUMN "type" varchar;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "chapterId" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_chapterId_chapters_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;