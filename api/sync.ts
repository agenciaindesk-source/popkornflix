import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
// Forzamos la ruta relativa exacta
import { PopkornScraper } from './lib/core'; 

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Verificación de Seguridad
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: "Falta la variable DATABASE_URL en Vercel" });
  }

  try {
    const sql = neon(dbUrl);
    const scraper = new PopkornScraper();
    
    // 2. Ejecución del Scraper
    const items = await scraper.getLatestContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "El scraper no encontró nada nuevo hoy." });
    }

    // 3. Inserción Masiva
    let addedCount = 0;
    for (const item of items) {
      // Limpiamos el título para crear un slug seguro
      const safeSlug = item.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      const safeId = item.externalId || safeSlug;

      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${safeId}, ${safeSlug}, ${item.title}, ${item.type || 'movie'}, ${item.posterUrl})
        ON CONFLICT (id) DO UPDATE SET poster_url = EXCLUDED.poster_url;
      `;
      addedCount++;
    }

    return res.status(200).json({ 
      success: true, 
      added: addedCount,
      db: "Conectado a Neon exitosamente" 
    });

  } catch (error: any) {
    // Este mensaje te dirá la verdad en el navegador
    return res.status(500).json({ 
      error: error.message,
      location: "Error dentro de api/sync.ts",
      hint: "Revisa que api/lib/core.ts tenga la clase PopkornScraper"
    });
  }
}
