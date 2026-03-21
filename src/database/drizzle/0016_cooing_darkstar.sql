ALTER TABLE "submissions" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "chapterId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "quizId" SET NOT NULL;