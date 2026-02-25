import { NextResponse } from 'next/server';
// Cambiamos @/ por la ruta real hacia la carpeta src
import { PopkornScraper } from '../../../src/lib/scraper/core';
import { db } from '../../../src/db';
import { content } from '../../../src/db/schema';

export const dynamic = 'force-dynamic'; 

export async function GET(req: Request) {
  try {
    const scraper = new PopkornScraper();
    const items = await scraper.getLatestContent();
    
    for (const item of items) {
      await db.insert(content).values({
        title: item.title,
        externalId: item.externalId,
        posterUrl: item.posterUrl,
        type: item.type,
        slug: item.title.toLowerCase().replace(/\s+/g, '-')
      }).onConflictDoNothing();
    }

    return NextResponse.json({ success: true, count: items.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
