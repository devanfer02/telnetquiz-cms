import { z } from "zod";
import { optionSchema } from "./option";

const MAX_FILE_SIZE = 5000000
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const questionSchema = z.object({
  image: z.any().refine((file) => file?.size <= MAX_FILE_SIZE, 'Max image size is 5MB').refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
  "Only .jpg, .jpeg, .png and .webp formats are supported."),
  description: z.string().min(3, { message: "Description must be at least 3 characters." }),
  question: z.string().min(3, { message: "Question must be at least 3 characters." }),
  options: z.array(optionSchema).min(2, "Must have at least two options.").refine(
    (options) => options.filter((option) => option.isCorrect).length === 1,
    {
      message: "Exactly one option must be correct.",
    }
  ),
});

export const questionsSchema = z.object({
  questions: z.array(questionSchema),
});

export type QuestionValues = z.infer<typeof questionSchema>;
export type QuestionsValues = z.infer<typeof questionsSchema>;
