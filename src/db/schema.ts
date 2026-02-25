import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const content = sqliteTable("content", {
  id: text("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'movie' | 'series'
  posterUrl: text("poster_url"),
  bannerUrl: text("banner_url"),
  rating: text("rating"),
  year: integer("year"),
  genres: text("genres"), // JSON string array
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const episodes = sqliteTable("episodes", {
  id: text("id").primaryKey(),
  contentId: text("content_id").notNull().references(() => content.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  season: integer("season").notNull(),
  number: integer("number").notNull(),
  slug: text("slug").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  contentId: text("content_id").references(() => content.id, { onDelete: 'cascade' }),
  episodeId: text("episode_id").references(() => episodes.id, { onDelete: 'cascade' }),
  provider: text("provider").notNull(),
  url: text("url").notNull(),
  quality: text("quality"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const watchHistory = sqliteTable("watch_history", {
  id: text("id").primaryKey(),
  contentId: text("content_id").notNull().references(() => content.id, { onDelete: 'cascade' }),
  episodeId: text("episode_id").references(() => episodes.id, { onDelete: 'cascade' }),
  progress: integer("progress").notNull(), // in seconds
  duration: integer("duration").notNull(), // in seconds
  lastWatched: integer("last_watched", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
