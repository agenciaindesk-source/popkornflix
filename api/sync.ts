import { VercelRequest, VercelResponse } from '@vercel/node';
import { PopkornScraper } from '../src/lib/scraper/core';
import { db } from '../src/db';
import { content } from '../src/db/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    // Insertamos las películas en la tabla que ya creaste
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
      message: "¡Películas enviadas a Neon!", 
      count: items.length 
    });
  } catch (error: any) {
    // Esto nos dirá exactamente qué falló en el link
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      detail: "Revisa si DATABASE_URL está configurada en Vercel"
    });
  }
}
