import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Falta DATABASE_URL" });

  try {
    const sql = neon(dbUrl);
    
    // 1. Obtenemos datos directamente de la API de NetMirror
    const response = await fetch('https://api.netmirrror.link/trending');
    const data = await response.json();
    const items = data.results || data;

    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "No se encontraron películas nuevas." });
    }

    // 2. Insertamos en tu tabla de Neon (basado en tu captura image_b2f745.png)
    let addedCount = 0;
    for (const item of items) {
      const title = item.title || item.name || 'Sin título';
      const slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      const id = (item.id || Math.random()).toString();
      const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '';

      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${id}, ${slug}, ${title}, ${item.media_type || 'movie'}, ${poster})
        ON CONFLICT (id) DO UPDATE SET poster_url = EXCLUDED.poster_url;
      `;
      addedCount++;
    }

    return res.status(200).json({ success: true, added: addedCount });

  } catch (error: any) {
    return res.status(500).json({ error: error.message, detail: "Error en sync.ts único" });
  }
}
