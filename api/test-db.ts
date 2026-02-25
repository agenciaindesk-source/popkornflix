import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).send("Falta DATABASE_URL en Vercel");

  try {
    const sql = neon(dbUrl);
    
    // Datos de prueba para llenar tu tabla 'content' (image_b2f745.png)
    const movies = [
      { id: '1', slug: 'batman', title: 'The Batman', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T6f0uVt.jpg' },
      { id: '2', slug: 'spiderman', title: 'Spider-Man', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/ldfCF96bd1NM9YpIaLc6o9B1pXy.jpg' },
      { id: '3', slug: 'avengers', title: 'Avengers', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/RYMX2wcGCBpqDTH3mqQCmSfsS0.jpg' }
    ];

    for (const m of movies) {
      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${m.id}, ${m.slug}, ${m.title}, ${m.type}, ${m.poster})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    return res.status(200).json({ success: true, message: "¡Base de datos llenada con éxito!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
