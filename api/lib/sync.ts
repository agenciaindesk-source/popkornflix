import { VercelRequest, VercelResponse } from '@vercel/node';
import { PopkornScraper } from './lib/core'; // Ruta directa dentro de api
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "No se encontraron pelis" });
    }

    for (const item of items) {
      // Usamos los nombres de columna exactos de tu tabla en Neon (image_b2f745.png)
      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${item.externalId}, ${item.title.toLowerCase().replace(/\s+/g, '-')}, ${item.title}, ${item.type}, ${item.posterUrl})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    return res.status(200).json({ success: true, count: items.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
