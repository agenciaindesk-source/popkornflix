import { VercelRequest, VercelResponse } from '@vercel/node';
// Usamos rutas relativas directas para saltar cualquier error de configuración
import { PopkornScraper } from '../src/lib/scraper/core';
import { db } from '../src/db';
import { content } from '../src/db/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "Sin pelis nuevas." });
    }

    for (const item of items) {
      await db.insert(content).values({
        title: item.title,
        externalId: item.externalId,
        posterUrl: item.posterUrl,
        type: item.type,
        slug: item.title.toLowerCase().replace(/\s+/g, '-')
      }).onConflictDoNothing();
    }

    return res.status(200).json({ success: true, count: items.length });
  } catch (error: any) {
    // Esto nos dirá el error real en pantalla, no más "Error 500" genérico
    return res.status(500).json({ 
      error: error.message, 
      stack: error.stack,
      path: "__dirname: " + __dirname 
    });
  }
}
