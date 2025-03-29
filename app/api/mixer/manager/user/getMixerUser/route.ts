import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";

export async function GET(req : NextRequest) {
  const session = await auth();
    
    if(!session){
        return NextResponse.json({ message: "Not Authenicated" },{ status: 403 });
    }
    if(session.user.role !== "ADMIN"){
        return NextResponse.json({ message: "Not Authorized" },{ status: 403 });
    }
    
  try {
    const searchParams = req.nextUrl.searchParams;

    const userId = searchParams.get("userId") || "";

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, image: true, name: true },
    });
    return NextResponse.json({ user: user, status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "error finding user in api",
    });
  }
}
