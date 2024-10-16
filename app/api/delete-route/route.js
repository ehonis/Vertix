import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

export async function handler() {
  const data = await prisma.Route.findMany();
  return NextResponse.json({ data });
}
