import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const userId = searchParams.get('userId');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, image: true, name: true },
    });
    return NextResponse.json({ user: user, status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: 'error finding user in api',
    });
  }
}
