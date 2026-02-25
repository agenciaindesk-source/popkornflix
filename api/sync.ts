import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const dbUrl = "postgresql://neondb_owner:npg_DLKwfAhoVT87@ep-dark-frog-ac5mg8rp-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"; // Usando tu URL verificada

  try {
    const sql = neon(dbUrl);
    
    // Datos reales para que la web funcione ya
    const movies = [
      { id: '1', slug: 'batman', title: 'The Batman', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T6f0uVt.jpg' },
      { id: '2', slug: 'spiderman', title: 'Spider-Man', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/ldfCF96bd1NM9YpIaLc6o9B1pXy.jpg' }
    ];

    for (const m of movies) {
      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${m.id}, ${m.slug}, ${m.title}, ${m.type}, ${m.poster})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    return res.status(200).send("ÉXITO: Datos cargados.");
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
