import { NextResponse } from 'next/server';
import { PopkornScraper } from '@/lib/scraper/core';
import { db } from '@/db';
import { content } from '@/db/schema';

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

    return NextResponse.json({ message: "Sincronización Exitosa", count: items.length });
  } catch (error) {
    return NextResponse.json({ error: "Error en el scraper" }, { status: 500 });
  }
}
