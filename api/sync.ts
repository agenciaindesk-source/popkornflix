import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
// Importación simplificada para evitar el error de "Module Not Found"
import { PopkornScraper } from './lib/core.js'; 

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Verificación inmediata de DB
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL no encontrada en Vercel" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const scraper = new PopkornScraper();
    
    // 2. Ejecutar Scraper
    const items = await scraper.getLatestContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "No hay contenido nuevo." });
    }

    // 3. Insertar en Neon (Usando los nombres de tu tabla en image_b2f745.png)
    for (const item of items) {
      const slug = item.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      const id = item.externalId || slug;

      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${id}, ${slug}, ${item.title}, ${item.type || 'movie'}, ${item.posterUrl})
        ON CONFLICT (id) DO UPDATE SET 
          poster_url = EXCLUDED.poster_url,
          updated_at = NOW();
      `;
    }

    return res.status(200).json({ success: true, added: items.length });

  } catch (error: any) {
    // Esto imprimirá el error real en tu pantalla en lugar de un 500 genérico
    return res.status(500).json({ 
      error: error.message,
      detail: "Error en la ejecución de la función sync"
    });
  }
}
