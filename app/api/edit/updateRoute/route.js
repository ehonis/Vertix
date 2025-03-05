import { NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function POST(request) {
  const { routeId, newTitle, newType, newGrade, newDate, newLocation } =
    await request.json();

  try {
    await prisma.Route.update({
      where: { id: routeId },
      data: {
        title: newTitle,
        type: newType,
        grade: newGrade,
        setDate: newDate,
        location: newLocation,
      },
    });
    return NextResponse.json(
      { status: 200 },
      { message: 'Successfully updated route' }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to update route', details: error.message },
      { status: 500 }
    );
  }
}
