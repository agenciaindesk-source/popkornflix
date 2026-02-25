import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// --- MOTOR INTEGRADO (Sin archivos externos) ---
async function getPopkornContent() {
  try {
    // Usamos la API de NetMirror que tienes abierta en tus pestañas
    const res = await fetch('https://api.netmirrror.link/trending');
    const data = await res.json();
    return data.map((item: any) => ({
      id: (item.id || Math.random()).toString(),
      title: item.title || item.name || 'Sin título',
      type: item.media_type || 'movie',
      poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : ''
    }));
  } catch (e) {
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Falta DATABASE_URL" });

  try {
    const sql = neon(dbUrl);
    const items = await getPopkornContent();
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: "No se encontró nada" });
    }

    // Insertamos en tu tabla 'content' (la que vemos vacía en image_b2f745.png)
    for (const item of items) {
      const slug = item.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      
      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${item.id}, ${slug}, ${item.title}, ${item.type}, ${item.poster_url})
        ON CONFLICT (id) DO UPDATE SET poster_url = EXCLUDED.poster_url;
      `;
    }

    return res.status(200).json({ success: true, added: items.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
