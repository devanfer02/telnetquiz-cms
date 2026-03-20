import z from "zod";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

export const imageFileSchema = z
	.any()
	.optional()
	.refine((file) => file?.size <= MAX_FILE_SIZE, "Max image size is 5MB")
	.refine(
		(file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
		"Only .jpg, .jpeg, .png and .webp formats are supported.",
	);

export const idNumberSchema = z.object({
	id: z.number().positive(),
});

export const idStringSchema = z.object({
	id: z.string().nonempty(),
});

export const chapterSchema = z.object({
	title: z.string().min(3, "Judul minimal 3 karakter"),
	description: z.string().min(10, "Deskripsi minimal 10 karakter"),
	mascotId: z.number().min(1, "Pilih mascot"),
});

export const optionSchema = z.object({
	text: z.string().min(1, { message: "Option text is required." }),
	questionId: z.string(),
	isCorrect: z.boolean().default(false),
});

export const questionSchema = z.object({
	type: z.enum(["pretest", "quiz"]),
	quizId: z.number().optional().nullable(),
	chapterId: z.number().optional().nullable(),
	materialId: z.number().optional().nullable(),
	image: imageFileSchema,
	description: z
		.string()
		.min(3, { message: "Description must be at least 3 characters." }),
	question: z
		.string()
		.min(3, { message: "Question must be at least 3 characters." }),
	options: z
		.array(optionSchema)
		.min(2, "Must have at least two options.")
		.refine(
			(options) => options.filter((option) => option.isCorrect).length === 1,
			{
				message: "Exactly one option must be correct.",
			},
		),
});

export const questionsSchema = z.object({
	type: z.enum(["pretest", "quiz"]),
	quizId: z.number().optional().nullable(),
	chapterId: z.number().optional().nullable(),
	materialId: z.number().optional(),
	questions: z.array(questionSchema),
});

export const studyMaterialSchema = z.object({
	title: z.string().min(3),
	imageFile: z
		.instanceof(File)
		.refine((file) => file?.size <= MAX_FILE_SIZE, "Max image size is 5MB")
		.refine(
			(file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
			"Only .jpg, .jpeg, .png and .webp formats are supported.",
		)
		.optional(),
	content: z.string(),
});

export const quizSchema = z.object({
	title: z.string().min(3, "Judul minimal 3 karakter"),
	difficulty: z.enum(["easy", "medium", "hard"]),
	level: z.number().positive(),
	chapterId: z.number().min(1, "Pilih chapter"),
});

export const editUserSchema = z.object({
	fullname: z.string().min(3).max(255),
	email: z.email().nonempty(),
	password: z
		.string()
		.min(6)
		.max(255)
		.regex(/\d/, "Must contain at least one number")
		.optional()
		.or(z.literal("")),
	schoolId: z.number().optional(),
	gender: z.boolean().optional(),
	grade: z.string().max(10).optional().or(z.literal("")),
});

export const schoolSchema = z.object({
	name: z.string().min(2, "Nama sekolah minimal 2 karakter"),
});

export type SchoolFormData = z.infer<typeof schoolSchema>;
export type EditUserFormData = z.infer<typeof editUserSchema>;
export type QuizFormData = z.infer<typeof quizSchema>;
export type OptionFormData = z.infer<typeof optionSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type QuestionsFormData = z.infer<typeof questionsSchema>;
export type ChapterFormData = z.infer<typeof chapterSchema>;
export type StudyMaterialFormData = z.infer<typeof studyMaterialSchema>;
