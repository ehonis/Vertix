import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function DELETE(request) {
  try {
    const body = await request.json(); // Parse the request body
    const { routeIds } = body; // Extract routeIds from the request body

    // Check if routeIds is an array and has values
    if (!routeIds || !Array.isArray(routeIds) || routeIds.length === 0) {
      return NextResponse.json({ message: "No valid route IDs provided" }, { status: 400 });
    }

    // Use Prisma to delete the routes with the provided IDs
    const deletedRoutes = await prisma.route.deleteMany({
      where: {
        id: {
          in: routeIds, // Pass the routeIds array directly to the 'in' operator
        },
      },
    });

    return NextResponse.json(
      {
        message: `Successfully deleted ${deletedRoutes.count} routes`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting routes:", error);
    return NextResponse.json({ message: "Failed to delete routes" }, { status: 500 });
  }
}
