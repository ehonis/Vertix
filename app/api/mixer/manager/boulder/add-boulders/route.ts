import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { auth } from "@/auth";


export async function POST(req: NextRequest)  {
    const session = await auth();

    if(!session){
        return NextResponse.json({ message: "Not Authenicated" },{ status: 403 });
    }
    if(session.user.role !== "ADMIN"){
        return NextResponse.json({ message: "Not Authorized" },{ status: 403 });
    }

  try {
    const {boulderData} = await req.json();

    console.log(boulderData)

    const result = await prisma.mixerBoulder.createMany({
        data: boulderData,
    })

  

    return NextResponse.json({ message: "Successfully created user" },{ status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
}
