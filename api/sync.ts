import { VercelRequest, VercelResponse } from '@vercel/node';
import { PopkornScraper } from './lib/core'; 
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verificamos la conexión antes de empezar
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "Falta DATABASE_URL en Vercel" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "No se encontraron películas nuevas." });
    }

    for (const item of items) {
      const slug = item.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      // Usamos el ID externo o el slug como ID único
      const id = item.externalId || slug;

      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${id}, ${slug}, ${item.title}, ${item.type || 'movie'}, ${item.posterUrl})
        ON CONFLICT (id) DO UPDATE SET poster_url = EXCLUDED.poster_url;
      `;
    }

    return res.status(200).json({ success: true, added: items.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
