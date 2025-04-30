import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
export async function POST(req: NextRequest) {
  const session = await auth();
    
    if(!session){
        return NextResponse.json({ message: "Not Authenicated" },{ status: 403 });
    }


  try {
    const { userId, routeId } = await req.json();

    await prisma.routeAttempt.upsert({
        where: {
          userId_routeId: {
            userId: userId,
            routeId: routeId,
          },
        },
        update: {
          attempts: { increment: 1 },
        },
        create: {
          userId: userId,
          routeId: routeId,
        },
      });
    

    return NextResponse.json({
      message: "Successfully Attempting Route",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
     { message: "error attempting route in api" }, {
        status: 500,
      },
      
    );
  }
}
