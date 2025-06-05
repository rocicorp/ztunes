import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './db/migrations',
  schema: './db/schema.ts',
  dialect: 'postgresql',
  strict: true,
  dbCredentials: {
    url: "postgres://postgres:pwd@localhost:5432/postgres",
  },
});
