import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    // Insertamos una película real de prueba para ver si el diseño funciona
    await sql`
      INSERT INTO content (id, slug, title, type, poster_url)
      VALUES ('test-1', 'batman-un-guerrero', 'Batman: El Caballero', 'movie', 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/74xTEgt7R36Fpooo50r9T6f0uVt.jpg')
      ON CONFLICT (id) DO NOTHING;
    `;
    return res.status(200).send("DATOS CARGADOS: Refresca la web principal ahora.");
  } catch (e: any) {
    return res.status(500).send("Error: " + e.message);
  }
}
