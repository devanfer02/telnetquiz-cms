import { env } from "@/lib/env"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  verbose: true,
  strict: true,
  schema: "./src/database/schema.ts",
  out: "./src/database/drizzle",
  dbCredentials: {
    url: env.NODE_ENV === "production" ? env.SUPABASE_DB_URL : env.SUPABASE_DB_TESTING_URL
  }
})