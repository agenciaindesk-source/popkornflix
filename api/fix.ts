import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    // Metemos datos manuales para que la web deje de estar negra
    await sql`
      INSERT INTO content (id, slug, title, type, poster_url)
      VALUES ('f1', 'batman-test', 'Batman de Prueba', 'movie', 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T6f0uVt.jpg')
      ON CONFLICT (id) DO NOTHING;
    `;
    return res.status(200).send("CONECTADO: Datos inyectados. Abre la web.");
  } catch (e: any) {
    return res.status(500).send("Error: " + e.message);
  }
}
