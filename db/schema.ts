import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const artistTable = pgTable("artist", {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  sortName: varchar("sort_name").notNull(),
  type: varchar(),
  beginDate: varchar("begin_date"),
  endDate: varchar("end_date"),
});

export const albumTable = pgTable("album", {
  id: varchar().primaryKey(),
  artistId: varchar("artist_id").notNull().references(() => artistTable.id),
  title: varchar().notNull(),
  year: integer(),
});
