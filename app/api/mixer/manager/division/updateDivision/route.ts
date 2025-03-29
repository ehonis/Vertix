import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
export async function POST(req: NextRequest) {
  const session = await auth();
    
    if(!session){
        return NextResponse.json({ message: "Not Authenicated" },{ status: 403 });
    }
    if(session.user.role !== "ADMIN"){
        return NextResponse.json({ message: "Not Authorized" },{ status: 403 });
    }
  try {
    const { divisionName, divisionId } = await req.json();

    await prisma.mixerDivision.update({
      where: {
        id: divisionId,
      },
      data: {
        name: divisionName,
      },
    });
    return NextResponse.json({
      message: "Successfully updated division",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "error updating division in api",
    });
  }
}
