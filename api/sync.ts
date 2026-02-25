import { VercelRequest, VercelResponse } from '@vercel/node';
import { PopkornScraper } from './lib/core'; 
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "No se encontraron películas." });
    }

    for (const item of items) {
      // Generamos un slug e ID si no existen
      const slug = item.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      const id = item.externalId || slug;

      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${id}, ${slug}, ${item.title}, ${item.type || 'movie'}, ${item.posterUrl})
        ON CONFLICT (id) DO UPDATE SET poster_url = EXCLUDED.poster_url;
      `;
    }

    return res.status(200).json({ success: true, added: items.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, stack: "Revisa que sync.ts esté en /api/ y core.ts en /api/lib/" });
  }
}
