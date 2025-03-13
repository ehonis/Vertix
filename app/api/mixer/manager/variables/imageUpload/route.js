import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { newImage, compId } = await req.json();
    console.log('image in api', newImage);
    await prisma.MixerCompetition.update({
      where: { id: compId },
      data: {
        imageUrl: newImage,
      },
    });

    return NextResponse.json(
      { message: 'Successfully added Image' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 500 },
      { message: 'error adding division in api' }
    );
  }
}
