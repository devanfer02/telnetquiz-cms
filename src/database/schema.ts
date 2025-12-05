import {
	pgTable,
	varchar,
	timestamp,
	serial,
	text,
	integer,
	boolean,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const timestamps = {
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: varchar("fullname").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

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

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  users: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  users: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

