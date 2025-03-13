import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { compId, statusOption } = await req.json();
    await prisma.MixerCompetition.update({
      where: { id: compId },
      data: {
        status: statusOption,
      },
    });

    return NextResponse.json(
      { message: 'Successfully updated status' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 500 },
      { message: 'error updating status in api' }
    );
  }
}
