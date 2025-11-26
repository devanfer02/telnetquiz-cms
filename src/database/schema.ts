import {
	pgTable,
	varchar,
	timestamp,
	serial,
	text,
	integer,
	boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const timestamps = {
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

export const users = pgTable("users", {
	id: varchar().primaryKey(),
	fullname: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	...timestamps,
});
export const chapters = pgTable("chapters", {
	id: serial().primaryKey(),
	title: varchar().notNull(),
	description: text().notNull(),
	mascotId: integer().notNull(),
	...timestamps,
});
export const quizzes = pgTable("quizzes", {
	id: serial().primaryKey(),
	chapterId: integer().references(() => chapters.id, { onDelete: "cascade" }),
	title: varchar().notNull(),
	difficulty: varchar({ enum: ["easy", "medium", "hard"] }),
	...timestamps,
});
export const questions = pgTable("questions", {
	id: serial().primaryKey(),
	quizId: integer().references(() => quizzes.id, { onDelete: "cascade" }),
	imageLink: varchar(),
	description: text().notNull(),
	question: varchar().notNull(),
	...timestamps,
});
export const options = pgTable("options", {
	id: serial().primaryKey(),
	questionId: integer().references(() => questions.id, { onDelete: "cascade" }),
	text: varchar().notNull(),
	isCorrect: boolean().notNull(),
	...timestamps,
});
export const submissions = pgTable("submissions", {
	id: serial().primaryKey(),
	userId: varchar().references(() => users.id, { onDelete: "cascade" }),
	chapterId: integer().references(() => chapters.id, { onDelete: "cascade" }),
	quizId: integer().references(() => quizzes.id, { onDelete: "cascade" }),
	score: integer(),
	...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
	submissions: many(submissions),
}));

export const chaptersRelations = relations(chapters, ({ many }) => ({
	quizzes: many(quizzes),
	submissions: many(submissions),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
	chapter: one(chapters, {
		fields: [quizzes.chapterId],
		references: [chapters.id],
	}),
	questions: many(questions),
	submissions: many(submissions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
	quiz: one(quizzes, {
		fields: [questions.quizId],
		references: [quizzes.id],
	}),
	options: many(options),
}));
export const optionsRelations = relations(options, ({ one }) => ({
	question: one(questions, {
		fields: [options.questionId],
		references: [questions.id],
	}),
}));
export const submissionsRelations = relations(submissions, ({ one }) => ({
	user: one(users, {
		fields: [submissions.userId],
		references: [users.id],
	}),
	chapter: one(chapters, {
		fields: [submissions.chapterId],
		references: [chapters.id],
	}),
	quiz: one(quizzes, {
		fields: [submissions.quizId],
		references: [quizzes.id],
	}),
}));
