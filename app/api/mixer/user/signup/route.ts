import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
export async function POST(req: NextRequest) {
  const session = await auth();
    if(!session){
        return NextResponse.json({ message: "Not Authenicated" },{ status: 403 });
    }

  const { userId, climberName, selectedDivision, compId } = await req.json();
  console.log(userId, climberName, selectedDivision, compId);
  try {
    await prisma.mixerClimber.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        name: climberName,
        division: {
          connect: {
            id: selectedDivision,
          },
        },
        entryMethod: "APP",
        competition: {
          connect: {
            id: compId,
          },
        },
      },
    });
    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json({ success: false, error: "failed to "});
  }
}
