import { NextResponse } from 'next/server';
import prisma from '@/prisma';
import { auth } from '@/auth';
export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' });
  }
  if (!req.auth.user.admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' });
  }
  try {
    const { climberId } = await req.json();

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
});
