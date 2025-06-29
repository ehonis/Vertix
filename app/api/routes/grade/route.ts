import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function POST(request: NextRequest) {
  const { userId, routeId, selectedGrade } = await request.json();
  try {
    const communityGrade = await prisma.communityGrade.upsert({
      where: { userId_routeId: { userId: userId, routeId: routeId } },
      update: { grade: selectedGrade },
      create: { userId: userId, routeId: routeId, grade: selectedGrade },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(

      { status: 500 }
    );
  }
}
