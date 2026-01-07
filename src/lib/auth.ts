import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "../database/schema";
import { Context, Layer } from "effect";
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
	},
	pages: {
		signIn: "/auth/sign-in",
	},
	plugins: [admin()],
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
					if (ctx?.path === "/callback/:id") {
						const allowedEmails = env.WHITELIST_GMAILS;

						if (!allowedEmails.includes(user.email)) {
							throw new APIError("FORBIDDEN", {
								message: "This Google account isn't authorized to sign in.",
								code: "WKKW",
							});
						}
					}
				},
			},
		},
	},
});

export class Auth extends Context.Tag("Db")<Auth, { auth: typeof auth }>() {}

export const AuthLayer = Layer.succeed(Auth, { auth });
