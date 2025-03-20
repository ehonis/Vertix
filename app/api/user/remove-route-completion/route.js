import prisma from "@/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { userId, routeId } = await request.json();

    // Validate required fields
    if (!userId || !routeId) {
      return NextResponse.json({ error: "userId and routeId are required" }, { status: 400 });
    }

    // Delete the route completion
    const deletion = await prisma.routeCompletion.deleteMany({
      where: {
        userId: userId,
        routeId: routeId,
      },
    });

    // Check if a record was actually deleted
    if (deletion.count === 0) {
      return NextResponse.json({ error: "No route completion found to delete" }, { status: 404 });
    }

    return NextResponse.json({ message: "Route completion removed successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to remove route from completions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
