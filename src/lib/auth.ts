import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, bearer } from "better-auth/plugins";
import { Context, Layer } from "effect";
import * as schema from "../database/schema";
import { db } from "./db";
import { env } from "./env";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
		schema: schema,
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 6,
	},
	pages: {
		signIn: "/auth/sign-in",
	},
	plugins: [admin(), bearer()],
	socialProviders: {
		google: {
			prompt: "select_account",
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user, ctx) => {
					const allowedEmails = env.WHITELIST_GMAILS;
					const isWhitelisted = allowedEmails.includes(user.email);

					if (ctx?.path === "/callback/:id") {
						if (!isWhitelisted) {
							throw new APIError("FORBIDDEN", {
								message: "This Google account isn't authorized to sign in.",
								code: "WKKW",
							});
						}
					}

					if (isWhitelisted) {
						return {
							data: {
								...user,
								role: "admin",
							},
						};
					}
				},
			},
		},
	},
});

export class Auth extends Context.Tag("Auth")<Auth, { auth: typeof auth }>() {}

export const AuthLayer = Layer.succeed(Auth, { auth });
