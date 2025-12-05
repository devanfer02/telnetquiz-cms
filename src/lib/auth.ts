import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "../database/schema";
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
	socialProviders: {
		// google: {
		//   clientId: env.GOOGLE_CLIENT_ID,
		//   clientSecret: env.GOOGLE_CLIENT_SECRET
		// }
	},
});
