CREATE TABLE "pretest_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"question_id" integer NOT NULL,
	"answered_option_id" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pretest_submissions" ADD CONSTRAINT "pretest_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pretest_submissions" ADD CONSTRAINT "pretest_submissions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pretest_submissions" ADD CONSTRAINT "pretest_submissions_answered_option_id_options_id_fk" FOREIGN KEY ("answered_option_id") REFERENCES "public"."options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pretest_submissions_userId_idx" ON "pretest_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pretest_submissions_questionId_idx" ON "pretest_submissions" USING btree ("question_id");