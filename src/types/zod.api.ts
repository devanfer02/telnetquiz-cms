import z from "zod";

export const registerUserSchema = z.object({
	fullname: z.string().min(3).max(255),
	email: z.email().nonempty(),
	password: z
		.string()
		.min(6)
		.max(255)
		.regex(/\d/, "Must contain at least one number"),
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

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export type VerifyAnswerData = z.infer<typeof verifyAnswerSchema>;

export const quizMaterialsSchema = z.object({
	quiz_id: z.number(),
});

export type QuizMaterialsData = z.infer<typeof quizMaterialsSchema>;
