import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { divisionName, divisionId } = await req.json();

    await prisma.MixerDivision.update({
      where: {
        id: divisionId,
      },
      data: {
        name: divisionName,
      },
    });
    return NextResponse.json({
      message: 'Successfully updated division',
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: 'error updating division in api',
    });
  }
}
