CREATE TABLE "question_materials" (
	"studyMaterialId" integer,
	"questionId" integer
);
--> statement-breakpoint
ALTER TABLE "study_materials" DROP CONSTRAINT "study_materials_questionId_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "study_materials" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "study_materials" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "question_materials" ADD CONSTRAINT "question_materials_studyMaterialId_study_materials_id_fk" FOREIGN KEY ("studyMaterialId") REFERENCES "public"."study_materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_materials" ADD CONSTRAINT "question_materials_questionId_questions_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_materials" DROP COLUMN "questionId";