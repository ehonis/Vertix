import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const res = await request.json();
  const { routeName, grade, type, color } = res;

  const currentDate = new Date();

  const result = await prisma.Route.create({
    data: {
      title: routeName,
      grade,
      type,
      color,
    },
  });

  return NextResponse.json({ result });
}
