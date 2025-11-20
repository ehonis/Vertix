import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
  }

  try {
    const { divisionName, compId } = await req.json();

    const division = await prisma.mixerDivision.create({
      data: {
        competitionId: compId,
        name: divisionName,
      },
    });
    return NextResponse.json(
      { data: division, message: "Successfully adding division" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error adding division in api" }, { status: 500 });
  }
}
