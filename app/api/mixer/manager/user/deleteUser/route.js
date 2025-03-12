import { NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function POST(request) {
  try {
    const { climberId } = await request.json();

    await prisma.MixerClimber.delete({
      where: { id: climberId },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: 'error finding user in api',
    });
  }
}
