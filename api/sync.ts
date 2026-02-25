import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Usamos tu URL de Neon directamente para asegurar la conexión
  const sql = neon("postgresql://neondb_owner:npg_DLKwfAhoVT87@ep-dark-frog-ac5mg8rp-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require");

  try {
    // 1. Obtenemos datos de la API externa
    const response = await fetch('https://api.netmirrror.link/trending');
    const data = await response.json();
    const items = data.results || data;

    // 2. Insertamos en tu tabla 'content'
    for (const item of items) {
      const title = item.title || item.name || 'Sin título';
      const slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '';

      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${item.id.toString()}, ${slug}, ${title}, ${item.media_type || 'movie'}, ${poster})
        ON CONFLICT (id) DO UPDATE SET poster_url = EXCLUDED.poster_url;
      `;
    }

    return res.status(200).json({ success: true, message: "Base de datos sincronizada." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
