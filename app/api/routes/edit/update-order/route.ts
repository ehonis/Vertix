import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { Route } from "@prisma/client";

export async function PATCH(request: NextRequest) {
  try {
    const routes = await request.json();
    console.log(routes);

    // Use a transaction to update each route individually with its specific order
    // This is necessary because updateMany can only set the same value for all records
    const updatedRoutes = await prisma.$transaction(
      routes.map((route: Route) =>
        prisma.route.update({
          where: { id: route.id },
          data: { order: route.order },
        })
      )
    );

    return NextResponse.json({
      message: "Order updated successfully",
      updatedCount: updatedRoutes.length,
    });
  } catch (error) {
    console.error("Error updating route order:", error);
    return NextResponse.json({ error: "Failed to update route order" }, { status: 500 });
  }
}
