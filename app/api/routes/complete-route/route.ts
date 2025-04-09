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

    const result = await prisma.routeCompletion.upsert({
        where: {
          userId_routeId: {
            userId: userId,
            routeId: routeId,
          },
        },
        update: {
          // For example, increment the sends count and update the completion date
          sends: { increment: 1 },
          completionDate: new Date(),
        },
        create: {
          userId: userId,
          routeId: routeId,
          // other fields with default values will be set if not provided
        },
      });
    

    return NextResponse.json({
      message: "Successfully Completed Route",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
     { message: "error completing route in api" }, {
        status: 500,
      },
      
    );
  }
}
