import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = neon("postgresql://neondb_owner:npg_DLKwfAhoVT87@ep-dark-frog-ac5mg8rp-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require");

  try {
    // Buscamos todas las películas guardadas
    const data = await sql`SELECT * FROM content ORDER BY created_at DESC LIMIT 50`;
    
    // Devolvemos el JSON que espera tu App.tsx
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
