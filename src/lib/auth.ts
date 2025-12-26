import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "../database/schema";
import { Context, Layer } from "effect";
import { env } from "./env";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
		schema: schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [admin()],
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
});

export class Auth extends Context.Tag("Db")<Auth, { auth: typeof auth }>() {}

export const AuthLayer = Layer.succeed(Auth, { auth });
