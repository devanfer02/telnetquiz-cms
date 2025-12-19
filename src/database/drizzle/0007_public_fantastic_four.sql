ALTER TABLE "question_materials" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "question_materials" CASCADE;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "materialId" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_materialId_study_materials_id_fk" FOREIGN KEY ("materialId") REFERENCES "public"."study_materials"("id") ON DELETE cascade ON UPDATE no action;