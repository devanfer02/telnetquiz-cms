import z from "zod";

export const registerUserSchema = z.object({
	fullname: z.string().min(3).max(255),
	email: z.email().nonempty(),
	password: z
		.string()
		.min(6)
		.max(255)
		.regex(/\d/, "Password harus mengandung minimal satu angka"),
	school_id: z.number().positive(),
	gender: z.boolean(),
	grade: z.string().min(1).max(10),
});

export const loginUserSchema = z.object({
	email: z.email().nonempty(),
	password: z.string(),
});

export const pretestSubmissionSchema = z.object({
	pretest_submissions: z.array(
		z.object({
			question_id: z.number(),
			answered_option_id: z.number(),
		}),
	),
});

export const questionQuerySchema = z.object({
	type: z.enum(["pretest", "quiz"]),
});

export const quizSubmissionSchema = z.object({
	answers: z.array(
		z.object({
			question_id: z.number(),
			answered_option_id: z.number(),
		}),
	),
});

export const updateProfileSchema = z.object({
	fullname: z.string().min(3).max(255).optional(),
	image: z.string().url().optional(),
	bio: z.string().max(500).optional(),
});

export type RegisterUserFormData = z.infer<typeof registerUserSchema>;

export type LoginUserFormData = z.infer<typeof loginUserSchema>;

export type PretestSubmissionFormData = z.infer<typeof pretestSubmissionSchema>;

export type QuestionQueryData = z.infer<typeof questionQuerySchema>;

export type QuizSubmissionFormData = z.infer<typeof quizSubmissionSchema>;

export const verifyAnswerSchema = z.object({
	quiz_id: z.number(),
	question_id: z.number(),
	answered_option_id: z.number(),
});

export const verifyPretestAnswerSchema = z.object({
	question_id: z.number(),
	answered_option_id: z.number(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export type VerifyAnswerData = z.infer<typeof verifyAnswerSchema>;

export type VerifyPretestAnswerData = z.infer<typeof verifyPretestAnswerSchema>;

export const quizMaterialsSchema = z.object({
	quiz_id: z.number(),
});

export type QuizMaterialsData = z.infer<typeof quizMaterialsSchema>;

export const bulkMaterialsSchema = z.object({
	material_ids: z.array(z.number()).min(1),
});

export type BulkMaterialsData = z.infer<typeof bulkMaterialsSchema>;

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1),
});

export type RefreshTokenFormData = z.infer<typeof refreshTokenSchema>;
