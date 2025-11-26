CREATE TABLE "chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"mascotId" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "options" (
	"id" serial PRIMARY KEY NOT NULL,
	"questionId" integer,
	"text" varchar NOT NULL,
	"isCorrect" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quizId" integer,
	"imageLink" varchar,
	"description" text NOT NULL,
	"question" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapterId" integer,
	"title" varchar NOT NULL,
	"difficulty" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar,
	"chapterId" integer,
	"quizId" integer,
	"score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"fullname" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
