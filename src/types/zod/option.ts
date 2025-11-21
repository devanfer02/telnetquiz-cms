import { z } from "zod";

export const optionSchema = z.object({
  text: z.string().min(1, { message: "Option text is required." }),
  isCorrect: z.boolean().default(false),
});

export type OptionValues = z.infer<typeof optionSchema>;
