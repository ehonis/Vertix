import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const text = searchParams.get('text');
    console.log(text);

    const users = await prisma.user.findMany({
      where: {
        OR: [{ name: { contains: text, mode: 'insensitive' } }],
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      take: 5,
    });
    return NextResponse.json({ users: users, status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: 'error finding users in api',
    });
  }
}
