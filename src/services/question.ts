import { createServerFn } from "@tanstack/react-start";
import { questionsSchema } from "@/types/zod";

export const createQuestions = createServerFn({
	method: "POST",
})
	.inputValidator(questionsSchema)
	.handler(async ({ data }) => {
		console.log(data);

		return { message: "OK" };
	});
