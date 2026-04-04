import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

export const timestamps = {
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

export const schools = pgTable("schools", {
	id: serial().primaryKey(),
	name: varchar().notNull(),
	isHidden: boolean("is_hidden").default(false).notNull(),
	...timestamps,
});

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: varchar("fullname").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	role: text("role"),
	schoolId: integer("school_id").references(() => schools.id),
	gender: boolean("gender"),
	grade: varchar("grade"),
	bio: text("bio"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	hasTakenPretest: boolean("has_taken_pretest").default(false).notNull(),
	banned: boolean("banned").default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
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
	minimumScore: integer("minimum_score").default(100).notNull(),
	isHidden: boolean("is_hidden").default(false).notNull(),
	...timestamps,
});
export const quizzes = pgTable(
	"quizzes",
	{
		id: serial().primaryKey(),
		chapterId: integer().references(() => chapters.id, { onDelete: "cascade" }),
		title: varchar().notNull(),
		level: integer().notNull(),
		difficulty: varchar({ enum: ["easy", "medium", "hard"] }).notNull(),
		...timestamps,
	},
	(t) => [unique("levels_quiz_unique").on(t.id, t.level)],
);
export const questions = pgTable(
	"questions",
	{
		id: serial().primaryKey(),
		type: varchar({ enum: ["pretest", "quiz"] }),
		chapterId: integer().references(() => chapters.id, { onDelete: "cascade" }),
		quizId: integer().references(() => quizzes.id, { onDelete: "cascade" }),
		materialId: integer().references(() => studyMaterials.id, {
			onDelete: "cascade",
		}),
		imageLink: varchar(),
		description: text().notNull(),
		question: text().notNull(),
		...timestamps,
	},
	(table) => [
		index("questions_type_idx").on(table.type),
		index("questions_chapterId_idx").on(table.chapterId),
		index("questions_quizId_idx").on(table.quizId),
	],
);
export const options = pgTable(
	"options",
	{
		id: serial().primaryKey(),
		questionId: integer()
			.references(() => questions.id, { onDelete: "cascade" })
			.notNull(),
		text: varchar().notNull(),
		isCorrect: boolean().notNull(),
		...timestamps,
	},
	(table) => [index("options_questionId_idx").on(table.questionId)],
);
export const submissions = pgTable(
	"submissions",
	{
		id: serial().primaryKey(),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		chapterId: integer()
			.notNull()
			.references(() => chapters.id, {
				onDelete: "cascade",
			}),
		quizId: integer()
			.notNull()
			.references(() => quizzes.id, { onDelete: "cascade" }),
		score: integer(),
		...timestamps,
	},
	(table) => [
		index("submissions_userId_idx").on(table.userId),
		index("submissions_chapterId_idx").on(table.chapterId),
		index("submissions_quizId_idx").on(table.quizId),
	],
);

export const pretestSubmissions = pgTable(
	"pretest_submissions",
	{
		id: serial().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		questionId: integer("question_id")
			.notNull()
			.references(() => questions.id, { onDelete: "cascade" }),
		answeredOptionId: integer("answered_option_id")
			.notNull()
			.references(() => options.id, { onDelete: "cascade" }),
		isCorrect: boolean("is_correct").notNull(),
		...timestamps,
	},
	(table) => [
		index("pretest_submissions_userId_idx").on(table.userId),
		index("pretest_submissions_questionId_idx").on(table.questionId),
	],
);

export const studyMaterials = pgTable("study_materials", {
	id: serial().primaryKey(),
	title: varchar().notNull(),
	imageLink: varchar(),
	content: text().notNull(),
	...timestamps,
});

export const achievements = pgTable("achievements", {
	id: serial().primaryKey(),
	slug: varchar().notNull().unique(),
	title: varchar().notNull(),
	description: text().notNull(),
	icon: varchar(),
	rule: jsonb().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	...timestamps,
});

export const userAchievements = pgTable(
	"user_achievements",
	{
		id: serial().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		achievementId: integer("achievement_id")
			.notNull()
			.references(() => achievements.id, { onDelete: "cascade" }),
		unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
	},
	(t) => [
		unique("user_achievement_unique").on(t.userId, t.achievementId),
		index("user_achievements_userId_idx").on(t.userId),
	],
);

export const achievementsRelations = relations(achievements, ({ many }) => ({
	userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(
	userAchievements,
	({ one }) => ({
		user: one(users, {
			fields: [userAchievements.userId],
			references: [users.id],
		}),
		achievement: one(achievements, {
			fields: [userAchievements.achievementId],
			references: [achievements.id],
		}),
	}),
);

export const schoolsRelations = relations(schools, ({ many }) => ({
	users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
	school: one(schools, { fields: [users.schoolId], references: [schools.id] }),
	submissions: many(submissions),
}));

export const chaptersRelations = relations(chapters, ({ many }) => ({
	quizzes: many(quizzes),
	questions: many(questions),
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
	chapter: one(chapters, {
		fields: [questions.chapterId],
		references: [chapters.id],
	}),
	studyMaterial: one(studyMaterials, {
		fields: [questions.materialId],
		references: [studyMaterials.id],
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

export const pretestSubmissionsRelations = relations(
	pretestSubmissions,
	({ one }) => ({
		user: one(users, {
			fields: [pretestSubmissions.userId],
			references: [users.id],
		}),
		question: one(questions, {
			fields: [pretestSubmissions.questionId],
			references: [questions.id],
		}),
		answeredOption: one(options, {
			fields: [pretestSubmissions.answeredOptionId],
			references: [options.id],
		}),
	}),
);

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

export const studyMaterialRelations = relations(studyMaterials, ({ many }) => ({
	questions: many(questions),
}));
