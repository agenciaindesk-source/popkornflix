import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// --- SCRAPER INTEGRADO (Para evitar errores de rutas) ---
class PopkornScraper {
  async getLatestContent() {
    try {
      const response = await fetch('https://api.netmirrror.link/trending'); // O tu URL real
      const data = await response.json();
      return data.map((item: any) => ({
        externalId: item.id?.toString() || Math.random().toString(36),
        title: item.title || item.name,
        type: item.media_type || 'movie',
        posterUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`
      }));
    } catch (e) {
      console.error("Error en scraper:", e);
      return [];
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "DATABASE_URL no encontrada" });

  try {
    const sql = neon(dbUrl);
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "No se encontró contenido nuevo." });
    }

    for (const item of items) {
      const slug = item.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      const id = item.externalId || slug;

      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${id}, ${slug}, ${item.title}, ${item.type}, ${item.posterUrl})
        ON CONFLICT (id) DO UPDATE SET poster_url = EXCLUDED.poster_url;
      `;
    }

    return res.status(200).json({ success: true, added: items.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
