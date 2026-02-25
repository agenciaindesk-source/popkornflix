import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import * as cheerio from 'cheerio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Conexión Directa a Neon (Usando tu URL verificada)
  const sql = neon("postgresql://neondb_owner:npg_DLKwfAhoVT87@ep-dark-frog-ac5mg8rp-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require");

  try {
    // 2. Ejecutar Scraping (Lógica de tu core.ts integrada)
    const baseUrl = 'https://net52.cc';
    const response = await fetch(`${baseUrl}/latest`);
    const html = await response.text();
    const $ = cheerio.load(html);
    const results: any[] = [];

    $('.movie-item').each((_, el) => {
      const title = $(el).find('.title').text().trim();
      const href = $(el).find('a').attr('href') || '';
      const slug = href.split('/').pop() || '';
      const posterUrl = $(el).find('img').attr('src') || '';
      const type = href.includes('/series/') ? 'series' : 'movie';

      if (title && slug) {
        results.push({ title, slug, type, posterUrl });
      }
    });

    if (results.length === 0) {
      return res.status(200).send("Scraper ejecutado: No se encontró contenido nuevo en net52.cc.");
    }

    // 3. Insertar en la base de datos
    for (const item of results) {
      // Usamos el slug como ID para evitar duplicados
      await sql`
        INSERT INTO content (id, slug, title, type, poster_url)
        VALUES (${item.slug}, ${item.slug}, ${item.title}, ${item.type}, ${item.posterUrl})
        ON CONFLICT (id) DO UPDATE SET 
          poster_url = EXCLUDED.poster_url,
          updated_at = NOW();
      `;
    }

    return res.status(200).send(`<h1>¡ÉXITO!</h1><p>Se han cargado ${results.length} películas/series. Refresca la web.</p>`);

  } catch (error: any) {
    return res.status(500).json({ 
      error: "Error en el servidor", 
      mensaje: error.message 
    });
  }
}
