import prisma from '@/prisma';
import { NextResponse } from 'next/server';
import { parseDateString } from '@/lib/dates';
import { set } from 'zod';
export async function POST(request) {
  const res = await request.json();
  const { routeName, grade, type, color, date, wallSection } = res;

  const dateObject = parseDateString(date);

  const result = await prisma.Route.create({
    data: {
      title: routeName,
      grade,
      type,
      color,
      setDate: dateObject,
      location: wallSection,
    },
  });

  return NextResponse.json({ result });
}
