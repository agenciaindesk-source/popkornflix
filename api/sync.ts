import { VercelRequest, VercelResponse } from '@vercel/node';
// Cambiamos la ruta para que sea absoluta desde la raíz del proyecto
import { PopkornScraper } from '../src/lib/scraper/core'; 
import { db } from '../src/db';
import { content } from '../src/db/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Asegurémonos de que la base de datos esté lista
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "Falta DATABASE_URL en Vercel" });
  }

  try {
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    // Si el scraper no trae nada, devolvemos error para saberlo
    if (!items || items.length === 0) {
      return res.status(200).json({ message: "Scraper ejecutado, pero no encontró pelis nuevas." });
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

    return res.status(200).json({ success: true, added: items.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
