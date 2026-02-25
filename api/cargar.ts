import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).send("ERROR: No hay DATABASE_URL en Vercel");

  try {
    const sql = neon(dbUrl);
    // Insertamos una película real para que veas que funciona
    await sql`
      INSERT INTO content (id, slug, title, type, poster_url)
      VALUES ('test-batman', 'batman-prueba', 'Batman de Prueba', 'movie', 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T6f0uVt.jpg')
      ON CONFLICT (id) DO NOTHING;
    `;
    return res.status(200).send("¡ÉXITO! Datos insertados. Refresca la web ahora.");
  } catch (error: any) {
    return res.status(500).send("Error de DB: " + error.message);
  }
}
