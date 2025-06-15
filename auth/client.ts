import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.VITE_PUBLIC_SERVER,
});
