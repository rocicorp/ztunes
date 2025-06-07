import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db";
import { must } from "../../shared/must";
import * as schema from "../../db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    github: {
      clientId: must(process.env.GITHUB_CLIENT_ID),
      clientSecret: must(process.env.GITHUB_CLIENT_SECRET),
    },
  },
});
