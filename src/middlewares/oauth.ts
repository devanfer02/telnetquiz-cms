import { auth } from "@/lib/auth";
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const oauthMiddleware = createMiddleware().server(async ({ next }) => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });

	if (session === null) {
		throw redirect({
			to: "/auth/sign-in",
		});
	}

	return await next();
});
