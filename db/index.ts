import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle("postgres://postgres:pwd@localhost:5432/postgres");
