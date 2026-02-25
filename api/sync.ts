import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// --- MOTOR DEL SCRAPER (Integrado para evitar errores de rutas) ---
class PopkornScraper {
  async getLatestContent() {
    try {
      // Aquí el scraper busca los datos (ejemplo simplificado)
      // Asegúrate de que este sea el código real de tu scraper
      return [
        { externalId: 'peli-1', title: 'Pelicula de Prueba', type: 'movie', posterUrl: 'https://via.placeholder.com/500' }
      ];
    } catch (e) {
      return [];
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Falta DATABASE_URL" });

  try {
    const sql = neon(dbUrl);
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "No se encontraron datos" });
    }

    for (const item of items) {
      const slug = item.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${item.externalId || slug}, ${slug}, ${item.title}, ${item.type}, ${item.posterUrl})
        ON CONFLICT (id) DO UPDATE SET poster_url = EXCLUDED.poster_url;
      `;
    }

    return res.status(200).json({ success: true, added: items.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, stack: "Error en la ejecución única" });
  }
}
