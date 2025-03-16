import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { id, name, username, tag } = await req.json();

  const updatedUser = await prisma.User.update({
    where: { id },
    data: { name, username, tag, isOnboarded: true },
  });
  return NextResponse.json(updatedUser);
}
