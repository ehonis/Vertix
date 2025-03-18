import prisma from '@/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' });
  }
  if (!req.auth.user.admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' });
  }
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
});
