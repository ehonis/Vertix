import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId, routeId } = await request.json();

    // Validate required fields
    if (!userId || !routeId) {
      return NextResponse.json(
        { error: 'userId and routeId are required' },
        { status: 400 }
      );
    }

    const completion = await prisma.routeCompletion.create({
      data: {
        user: { connect: { id: userId } },
        route: { connect: { id: routeId } },
      },
    });

    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add route to completion', details: error.message },
      { status: 500 }
    );
  }
}
