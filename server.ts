import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./src/db/schema.ts";
import { PopkornScraper } from "./src/lib/scraper/core.ts";
import { eq, like, or } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

const sqlite = new Database("popkorn.db");
const db = drizzle(sqlite, { schema });

// Initialize database
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    poster_url TEXT,
    banner_url TEXT,
    rating TEXT,
    year INTEGER,
    genres TEXT,
    created_at INTEGER,
    updated_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS episodes (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    season INTEGER NOT NULL,
    number INTEGER NOT NULL,
    slug TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    content_id TEXT REFERENCES content(id) ON DELETE CASCADE,
    episode_id TEXT REFERENCES episodes(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    url TEXT NOT NULL,
    quality TEXT,
    created_at INTEGER
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const scraper = new PopkornScraper();

  app.use(express.json());

  // API Routes
  app.get("/api/content", async (req, res) => {
    try {
      const results = await db.query.content.findMany({
        limit: 50,
        orderBy: (content, { desc }) => [desc(content.createdAt)],
      });
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.get("/api/content/:slug", async (req, res) => {
    try {
      const item = await db.query.content.findFirst({
        where: eq(schema.content.slug, req.params.slug),
      });
      if (!item) return res.status(404).json({ error: "Not found" });
      
      const episodes = await db.query.episodes.findMany({
        where: eq(schema.episodes.contentId, item.id),
      });

      res.json({ ...item, episodes });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch details" });
    }
  });

  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.json([]);
    
    try {
      const results = await db.query.content.findMany({
        where: or(
          like(schema.content.title, `%${query}%`),
          like(schema.content.description, `%${query}%`)
        ),
        limit: 20
      });
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.post("/api/cron/sync", async (req, res) => {
    console.log("Starting sync...");
    try {
      const latest = await scraper.fetchLatest();
      
      for (const item of latest) {
        const existing = await db.query.content.findFirst({
          where: eq(schema.content.slug, item.slug)
        });

        if (!existing) {
          await db.insert(schema.content).values({
            id: uuidv4(),
            slug: item.slug,
            title: item.title,
            type: item.type,
            posterUrl: item.posterUrl,
            year: item.year || 2024,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      
      res.json({ success: true, count: latest.length });
    } catch (error) {
      console.error("Sync failed:", error);
      res.status(500).json({ error: "Sync failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
