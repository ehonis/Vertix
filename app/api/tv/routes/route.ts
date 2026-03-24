import { NextResponse, NextRequest } from "next/server";
import { searchTvRoutes, updateTvSlideRoutes } from "@/lib/tv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const searchTerm = searchParams.get("text") || "";
  const slideId = searchParams.get("slideId") || "";

  let routes: Awaited<ReturnType<typeof searchTvRoutes>> = [];
  if (searchTerm.length > 3) {
    routes = await searchTvRoutes(searchTerm, slideId);
  }

  return NextResponse.json({
    routes,
  });
}

export async function POST(req: NextRequest) {
  const { functionName, routeId, imageUrl, slideId } = await req.json();
  if (functionName === "addRoute") {
    await updateTvSlideRoutes({
      functionName,
      routeId,
      slideId,
    });
    return NextResponse.json({ message: "Route added successfully" }, { status: 200 });
  }
  if (functionName === "uploadImage") {
    await updateTvSlideRoutes({
      functionName,
      routeId,
      imageUrl,
      slideId,
    });
    return NextResponse.json({ message: "Image uploaded successfully" }, { status: 200 });
  }
  if (functionName === "removeRoute") {
    await updateTvSlideRoutes({
      functionName,
      routeId,
      slideId,
    });
    return NextResponse.json({ message: "Route removed successfully" }, { status: 200 });
  }
  return NextResponse.json({ error: "Invalid function name" }, { status: 400 });
}
