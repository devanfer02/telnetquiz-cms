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

export type RegisterUserFormData = z.infer<typeof registerUserSchema>;

export type LoginUserFormData = z.infer<typeof loginUserSchema>;

export type PretestSubmissionFormData = z.infer<typeof pretestSubmissionSchema>;

export type QuestionQueryData = z.infer<typeof questionQuerySchema>;
