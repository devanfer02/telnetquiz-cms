CREATE INDEX "options_questionId_idx" ON "options" USING btree ("questionId");--> statement-breakpoint
CREATE INDEX "questions_chapterId_idx" ON "questions" USING btree ("chapterId");--> statement-breakpoint
CREATE INDEX "questions_quizId_idx" ON "questions" USING btree ("quizId");--> statement-breakpoint
CREATE INDEX "submissions_userId_idx" ON "submissions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "submissions_chapterId_idx" ON "submissions" USING btree ("chapterId");--> statement-breakpoint
CREATE INDEX "submissions_quizId_idx" ON "submissions" USING btree ("quizId");