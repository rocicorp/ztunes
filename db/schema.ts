import { index, integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import * as authSchema from "../auth/schema";

export * from "../auth/schema";

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

export const album = pgTable("album", {
  id: varchar().primaryKey(),
  artistId: varchar("artist_id").notNull().references(() => artist.id),
  title: varchar().notNull(),
  year: integer(),
});

export const cart = pgTable("cart", {
  id: varchar().primaryKey(),
  userId: varchar("user_id").notNull().references(() => authSchema.user.id),
});

export const cartItem = pgTable("cart_item", {
  id: varchar().primaryKey(),
  cartId: varchar("cart_id").notNull().references(() => cart.id),
  albumId: varchar("album_id").notNull().references(() => album.id),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const userRelations = relations(authSchema.user, ({ one }) => ({
  cart: one(cart, {
    fields: [authSchema.user.id],
    references: [cart.userId],
  }),
}));

export const artistRelations = relations(artist, ({ many }) => ({
  albums: many(album),
}));

export const albumRelations = relations(album, ({ one }) => ({
  artist: one(artist, {
    fields: [album.artistId],
    references: [artist.id],
  }),
}));

export const cartRelations = relations(cart, ({ many }) => ({
  items: many(cartItem),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  cart: one(cart, {
    fields: [cartItem.cartId],
    references: [cart.id],
  }),
  album: one(album, {
    fields: [cartItem.albumId],
    references: [album.id],
  }),
}));