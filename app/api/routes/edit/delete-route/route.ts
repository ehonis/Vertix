import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { Route } from "@prisma/client";
import { auth } from "@/auth";

export async function DELETE(request: NextRequest) {

  const session = await auth();

    if(!session){
        return NextResponse.json({ message: "Not Authenicated" },{ status: 403 });
    }
    if(session.user.role !== "ADMIN"){
        return NextResponse.json({ message: "Not Authorized" },{ status: 403 });
    }
  const { routes  }: {routes: Route[]} = await request.json();

  try {
    await prisma.route.deleteMany({
      where:{ id: { in: routes.map((route) => route.id) } }
    });
    return NextResponse.json({ message: "Successfully deleted routes" }, { status: 200 } );
    
  } catch (error) {

    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete routes"},
      { status: 500 }
    );
  }
}
