import { accounts } from "@/database/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

export const oauthMiddleware = createMiddleware().server(async ({ next }) => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });

	if (session === null) {
		throw redirect({
			to: "/auth/sign-in",
		});
	}

	const [account] = await db
		.select({ providerId: accounts.providerId })
		.from(accounts)
		.where(eq(accounts.userId, session.user.id))
		.limit(1);

	if (account.providerId !== "google") {
		throw redirect({
			to: "/auth/sign-in",
			search: {
				error: "Account provider not allowed",
			},
		});
	}

	return await next();
});
