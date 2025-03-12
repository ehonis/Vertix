import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { divisionsToDelete } = await req.json();
    console.log(divisionsToDelete);
    if (divisionsToDelete.length === 0) {
      return NextResponse.json(
        { message: 'You cannot delete nothing' },
        { status: 500 }
      );
    }

    divisionsToDelete.forEach(async (id) => {
      await prisma.MixerDivision.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: 'Successfully deleted divisions',
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
      },
      { message: 'error deleting division in api' }
    );
  }
}
