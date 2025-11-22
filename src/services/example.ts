import { createServerFn } from "@tanstack/react-start";

export const updateCount = createServerFn({
	method: "POST",
})
	.inputValidator((d: number) => d)
	.handler(async ({ data }) => {
		console.log(data);

		return { message: "OK" };
	});
