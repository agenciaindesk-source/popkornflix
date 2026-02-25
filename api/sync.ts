import { VercelRequest, VercelResponse } from '@vercel/node';
import { PopkornScraper } from '../src/lib/scraper/core';
import { db } from '../src/db';
import { content } from '../src/db/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "No se encontraron películas nuevas." });
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

    return res.status(200).json({ 
      success: true, 
      added: items.length,
      message: "Sincronización exitosa con Neon" 
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: "Asegúrate de que DATABASE_URL esté en Environment Variables de Vercel" 
    });
  }
}
