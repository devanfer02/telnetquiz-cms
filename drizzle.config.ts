import { env } from "@/lib/env"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  verbose: true,
  strict: true,
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.SUPABASE_DB_URL
  }
})