import { env } from "@/lib/env.mjs";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema/index.ts",
  dialect: "postgresql",
  out: "./src/lib/db/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  }
} satisfies Config;