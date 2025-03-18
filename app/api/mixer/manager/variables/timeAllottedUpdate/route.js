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
    const { compId, compTime } = await req.json();
    const parsedIntTime = parseInt(compTime);
    await prisma.MixerCompetition.update({
      where: { id: compId },
      data: {
        time: parsedIntTime,
      },
    });

    return NextResponse.json(
      { message: 'Successfully updated time allotted' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 500 },
      { message: 'error updating tiem allotted in api' }
    );
  }
});
