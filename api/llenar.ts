import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO content (id, slug, title, type, poster_url)
      VALUES ('peli-1', 'batman-prueba', 'Batman: El Caballero', 'movie', 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T6f0uVt.jpg')
      ON CONFLICT (id) DO NOTHING;
    `;
    return res.status(200).send("¡DATOS CARGADOS! Refresca tu web ahora.");
  } catch (e: any) {
    return res.status(500).send("Error de Neon: " + e.message);
  }
}
