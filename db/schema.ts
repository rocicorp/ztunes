import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export * from "../app/lib/auth-schema"

export const artist = pgTable("artist", {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  sortName: varchar("sort_name").notNull(),
  type: varchar(),
  beginDate: varchar("begin_date"),
  endDate: varchar("end_date"),
}, table => [
  index('artist_name_idx').on(table.name),
]);

export const artistRelations = relations(artist, ({ many }) => ({
  albums: many(album),
}));

export const album = pgTable("album", {
  id: varchar().primaryKey(),
  artistId: varchar("artist_id").notNull().references(() => artist.id),
  title: varchar().notNull(),
  year: integer(),
});

export const albumRelations = relations(album, ({ one }) => ({
  artist: one(artist, {
    fields: [album.artistId],
    references: [artist.id],
  }),
}));
