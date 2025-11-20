import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
  }
  try {
    const searchParams = req.nextUrl.searchParams;

    const text = searchParams.get("text") || "";

    const users = await prisma.user.findMany({
      where: {
        OR: [{ name: { contains: text, mode: "insensitive" } }],
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
      message: "error finding users in api",
    });
  }
}
