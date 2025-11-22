import z from "zod";

export const QuizSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  numberOfQuestions: z.number().min(1, "Jumlah soal minimal 1"),
  chapterId: z.number().min(1, "Pilih chapter"),
});

export type QuizFormData  = z.infer<typeof QuizSchema>
