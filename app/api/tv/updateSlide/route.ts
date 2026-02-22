import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/prisma";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } else if (session.user.role != UserRole.ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { slideId, isActive } = await req.json();

  await prisma.tVSlide.update({
    where: { id: slideId },
    data: { isActive },
  });

  return NextResponse.json({ message: "Slide updated successfully" }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();

  console.log(session?.user);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } else if (session.user.role != UserRole.ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { type, imageUrl, text, isActive } = await req.json();

  await prisma.tVSlide.create({
    data: {
      type,
      imageUrl,
      text,
      isActive,
    },
  });

  return NextResponse.json({ message: "Slide created successfully" }, { status: 200 });
}
