import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { calculateStandings } from "@/lib/mixers";
export async function POST(req: NextRequest) {

  const session = await auth();
  
    if(!session){
        return NextResponse.json({ message: "Not Authenicated" },{ status: 403 });
    }
    if(session.user.role !== "ADMIN"){
        return NextResponse.json({ message: "Not Authorized" },{ status: 403 });
    }

  try {
    const { compId } = await req.json();
    await calculateStandings(compId);
    return NextResponse.json({ message: "Successfully exported standings" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error updating name in api" }, { status: 500 } );
  }
}
