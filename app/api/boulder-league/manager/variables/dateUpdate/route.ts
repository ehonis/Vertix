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
    const { compId, dateObject, week } = await req.json();
    const parsedDate = new Date(dateObject);
    if(week === 1){
      await prisma.bLCompetition.update({
        where: { id: compId },
        data: {
          weekOneStartDate: parsedDate,
        },
      });
    }
    if(week === 2){
      await prisma.bLCompetition.update({
        where: { id: compId },
        data: {
          weekTwoStartDate: parsedDate,
        },
      });
    }
    if(week === 3){
      await prisma.bLCompetition.update({
        where: { id: compId },
        data: {
          weekThreeStartDate: parsedDate,
        },
      });
    }
   

    return NextResponse.json({ message: "Successfully updated time allotted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json( { message: "error updating time allotted in api" }, { status: 500 });
  }
}
