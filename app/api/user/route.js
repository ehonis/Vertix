import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { URL } from 'url';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  //   const res = await request.json();
  //   const { username, email } = res;

  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const email = searchParams.get('email');

  const data = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
  return NextResponse.json({ data });
}

export async function POST(request) {
  const res = await request.json();
  const { username, email, hashedPassword } = res;

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ newUser });
}
