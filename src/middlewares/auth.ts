import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { accounts } from "@/database/schema";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";

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

	if (account === null) {
		throw redirect({
			to: "/auth/sign-in",
			search: {
				error: "Can't find user account",
			},
		});
	}

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

export const authMiddleware = createMiddleware().server(async ({ next }) => {
	const headers = getRequestHeaders();

	let session: Awaited<ReturnType<typeof auth.api.getSession>>;
	try {
		session = await auth.api.getSession({ headers });
	} catch {
		return response(
			{
				message: "Unauthorized",
			},
			HttpStatus.UNAUTHORIZED,
		);
	}

	if (session === null) {
		return response(
			{
				message: "Unauthorized",
			},
			HttpStatus.UNAUTHORIZED,
		);
	}

	return await next({
		context: {
			user: session.user,
			session: session.session,
		},
	});
});
