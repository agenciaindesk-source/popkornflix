import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// --- MOTOR DEL SCRAPER INTEGRADO ---
class PopkornScraper {
  async getLatestContent() {
    try {
      // Reemplaza esta URL por la API real que usas en tu core.ts
      const response = await fetch('https://api.netmirrror.link/trending'); 
      const data = await response.json();
      
      // Mapeamos los datos para que coincidan con tu base de datos
      return (data.results || data).map((item: any) => ({
        externalId: (item.id || Math.random()).toString(),
        title: item.title || item.name || 'Sin título',
        type: item.media_type || 'movie',
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750'
      }));
    } catch (e) {
      console.error("Error en scraper:", e);
      return [];
    }
  }
}

// --- FUNCIÓN PRINCIPAL ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verificamos la variable que vimos en tu captura image_16fc55.png
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: "No se encuentra DATABASE_URL en Vercel" });
  }

  try {
    const sql = neon(dbUrl);
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "No se encontraron películas nuevas." });
    }

    // Insertamos directamente en tu tabla de Neon (image_b2f745.png)
    for (const item of items) {
      const slug = item.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      
      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${item.externalId}, ${slug}, ${item.title}, ${item.type}, ${item.posterUrl})
        ON CONFLICT (id) DO UPDATE SET poster_url = EXCLUDED.poster_url;
      `;
    }

    return res.status(200).json({ 
      success: true, 
      added: items.length,
      message: "¡Base de datos actualizada!" 
    });

  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message,
      hint: "Revisa que la tabla 'content' exista en Neon" 
    });
  }
}
