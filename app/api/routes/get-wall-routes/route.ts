import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    
    const searchParams = req.nextUrl.searchParams;

    // Access individual query parameters
    const wall = searchParams.get("wall");

    const data = await prisma.route.findMany({
        where: {location: (wall as string)},
    })



   
    return NextResponse.json(
        {
          data: data,
        },
        {
          status: 200,
        }
      );
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "error changing username",
    });
  }
}
