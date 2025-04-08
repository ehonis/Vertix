import prisma from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const searchTerm = searchParams.get("text") || "";
    const takeStr = searchParams.get("take");
    const skipStr = searchParams.get("skip");

    const parsedTake = takeStr ? parseInt(takeStr, 10) : 10;
    const parsedSkip = skipStr ? parseInt(skipStr, 10) : 0;

    

    const data = await prisma.route.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { color: { contains: searchTerm, mode: "insensitive" } },
          { grade: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      skip: parsedSkip,
      take: parsedTake,
    });

    const totalCount = await prisma.route.count({ where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { color: { contains: searchTerm, mode: "insensitive" } },
          { grade: { contains: searchTerm, mode: "insensitive" } },
        ],
      } });
    // Determine whether there are more routes beyond this "page"
    const hasMore = totalCount > parsedSkip + data.length;

    return NextResponse.json(
      {
        data,
        hasMore,
        totalCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json(
      { message: "An error occurred", status: 500 },
      { status: 500 }
    );
  }
}
