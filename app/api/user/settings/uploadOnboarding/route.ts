import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req : NextRequest) {
  const { id, name, username, tag } = await req.json();

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { name, username, tag, isOnboarded: true },
  });
  return NextResponse.json(updatedUser);
}
