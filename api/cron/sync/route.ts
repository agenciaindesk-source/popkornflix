import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Aquí llamaremos a tu lógica de scraping
  return NextResponse.json({ message: "Motor de sincronización activado correctamente" });
}
