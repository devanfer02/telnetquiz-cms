import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDbMode, setDbMode } from "@/lib/db";

export const getCurrentDbMode = createServerFn({ method: "GET" }).handler(
	async () => {
		return { mode: getDbMode() };
	},
);

export const switchDbMode = createServerFn({ method: "POST" })
	.inputValidator(z.object({ mode: z.enum(["production", "testing"]) }))
	.handler(async ({ data }) => {
		setDbMode(data.mode);
		return { mode: getDbMode() };
	});
