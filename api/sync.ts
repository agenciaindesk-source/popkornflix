import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Conexión directa a tu base de datos
  const sql = neon("postgresql://neondb_owner:npg_DLKwfAhoVT87@ep-dark-frog-ac5mg8rp-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require");

  try {
    const response = await fetch('https://api.netmirrror.link/trending');
    const data = await response.json();
    const items = data.results || data;

    for (const item of items) {
      const title = item.title || item.name || 'Pelicula';
      const slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '';

      // Insertamos en la tabla 'content' que vimos vacía
      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${item.id.toString()}, ${slug}, ${title}, ${item.media_type || 'movie'}, ${poster})
        ON CONFLICT (id) DO UPDATE SET poster_url = EXCLUDED.poster_url;
      `;
    }
    return res.status(200).send("EXITO: Datos cargados correctamente.");
  } catch (e: any) {
    return res.status(500).send("Error crítico: " + e.message);
  }
}
