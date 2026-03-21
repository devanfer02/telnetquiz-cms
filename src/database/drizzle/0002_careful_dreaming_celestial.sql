ALTER TABLE "quizzes" ALTER COLUMN "difficulty" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "level" integer NOT NULL;