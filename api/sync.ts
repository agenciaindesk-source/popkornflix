import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Tu URL de conexión que vimos en las capturas
  const dbUrl = "postgresql://neondb_owner:npg_DLKwfAhoVT87@ep-dark-frog-ac5mg8rp-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require";

  try {
    const sql = neon(dbUrl);
    
    // 1. Buscamos tendencias en la API
    const response = await fetch('https://api.netmirrror.link/trending');
    const data = await response.json();
    const items = data.results || data;

    if (!items || items.length === 0) {
      return res.status(200).send("No se encontraron películas en la API.");
    }

    // 2. Limpiamos y guardamos en Neon
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

    return res.status(200).send("¡ÉXITO! Base de datos llenada. Refresca la web ahora.");
  } catch (error: any) {
    return res.status(500).send("Error: " + error.message);
  }
}
