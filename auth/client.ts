import { createAuthClient } from "better-auth/react"
import { must } from "../shared/must"
import "../shared/env"

const baseURL = must(process.env.BETTER_AUTH_URL, "BETTER_AUTH_URL is required")

export const authClient = createAuthClient({
  baseURL,
});
