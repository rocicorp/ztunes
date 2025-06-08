import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { must } from "../shared/must";
import * as schema from "./schema";
import { jwt } from "better-auth/plugins"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [jwt()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds
    }
  },
  socialProviders: {
    github: {
      clientId: must(process.env.GITHUB_CLIENT_ID),
      clientSecret: must(process.env.GITHUB_CLIENT_SECRET),
    },
  },
});
