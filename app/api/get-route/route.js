import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await prisma.Route.findMany();
  return NextResponse.json({ data });
}
