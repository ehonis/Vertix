import { NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function POST(request) {
  const { userId, routeId, isGraded, selectedGrade } = await request.json();
  try {
    if (isGraded) {
      const updateResult = await prisma.CommunityGrade.updateMany({
        where: { userId: userId, routeId: routeId },
        data: { grade: selectedGrade },
      });
      if (updateResult.count === 0) {
        console.log('No matching record found to update.');
        return NextResponse.json(
          { error: 'No matching record found' },
          { status: 404 }
        );
      }
    } else {
      await prisma.CommunityGrade.create({
        data: {
          user: { connect: { id: userId } },
          route: { connect: { id: routeId } },
          grade: selectedGrade,
        },
      });
    }
    return NextResponse.json(
      { status: 200 },
      { message: 'Successfully created or updated commnity grade' }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add route to completion', details: error.message },
      { status: 500 }
    );
  }
}
