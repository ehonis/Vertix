import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { userId, routeId, rating, comment } = await request.json();

  try {
    const response = await prisma.RouteStar.create({
      data: {
        user: { connect: { id: userId } },
        route: { connect: { id: routeId } },
        stars: rating,
        comment: comment,
      },
    });
    if (!response.ok) {
      return NextResponse.json({ status: 400 });
    }
    return NextResponse.json(
      { status: 200 },
      { message: 'Successfully Rated Route' }
    );
  } catch (error) {
    return NextResponse.json({ status: 400 }, { message: `error: ${error}` });
  }
}
