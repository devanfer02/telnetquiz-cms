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

export type RegisterUserFormData = z.infer<typeof registerUserSchema>;
