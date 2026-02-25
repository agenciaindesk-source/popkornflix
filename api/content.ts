import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = neon("postgresql://neondb_owner:npg_DLKwfAhoVT87@ep-dark-frog-ac5mg8rp-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require");

  try {
    // Intentamos traer los datos
    const data = await sql`SELECT * FROM content LIMIT 50`;
    
    // Si no hay nada, mandamos un "Batman" de prueba para que no veas la web negra
    if (data.length === 0) {
      return res.status(200).json([{
        id: '1',
        title: 'Haz clic en SYNC DATABASE abajo',
        slug: 'error-vacio',
        type: 'movie',
        poster_url: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T6f0uVt.jpg'
      }]);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
