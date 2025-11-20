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
    const { divisionsToDelete } = await req.json();
    console.log(divisionsToDelete);
    if (divisionsToDelete.length === 0) {
      return NextResponse.json({ message: "You cannot delete nothing" }, { status: 500 });
    }

    divisionsToDelete.forEach(async (id: string) => {
      await prisma.bLDivision.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Successfully deleted divisions",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "error deleting division in api" },
      {
        status: 500,
      }
    );
  }
}
