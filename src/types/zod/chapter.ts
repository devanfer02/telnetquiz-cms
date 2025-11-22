import z from "zod";

export const chapterSchema = z.object({
	title: z.string().min(3, "Judul minimal 3 karakter"),
	description: z.string().min(10, "Deskripsi minimal 10 karakter"),
	mascotId: z.number().min(1, "Pilih mascot"),
});

export type ChapterFormData = z.infer<typeof chapterSchema>;
