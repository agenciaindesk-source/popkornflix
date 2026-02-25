import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const content = pgTable("content", {
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const episodes = pgTable("episodes", {
  id: text("id").primaryKey(),
  contentId: text("content_id").notNull().references(() => content.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  season: integer("season").notNull(),
  number: integer("number").notNull(),
  slug: text("slug").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sources = pgTable("sources", {
  id: text("id").primaryKey(),
  contentId: text("content_id").references(() => content.id, { onDelete: 'cascade' }),
  episodeId: text("episode_id").references(() => episodes.id, { onDelete: 'cascade' }),
  provider: text("provider").notNull(),
  url: text("url").notNull(),
  quality: text("quality"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const watchHistory = pgTable("watch_history", {
  id: text("id").primaryKey(),
  contentId: text("content_id").notNull().references(() => content.id, { onDelete: 'cascade' }),
  episodeId: text("episode_id").references(() => episodes.id, { onDelete: 'cascade' }),
  progress: integer("progress").notNull(), // in seconds
  duration: integer("duration").notNull(), // in seconds
  lastWatched: timestamp("last_watched").defaultNow(),
});
