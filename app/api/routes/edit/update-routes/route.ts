import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { RouteType } from "@prisma/client";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { TransformedRoute } from "@/app/ui/admin/route-edit/new-route-popup";
export async function PATCH(req: Request) {
    const session = await auth();
    if(!session){
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }else if(session.user.role != UserRole.ADMIN && session.user.role != UserRole.ROUTE_SETTER){
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { routesToChange  }: { routesToChange: TransformedRoute[] } = await req.json();
    console.log(routesToChange);

    const updatedRoutes = await prisma.$transaction(
        routesToChange.map(route =>
            prisma.route.update({
                where: { id: route.id },
                data: { order: route.order }
            })
        )
    );
    return NextResponse.json({ message: "Routes updated successfully" });
}