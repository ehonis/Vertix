import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { RouteType, UserRole, Locations } from "@/generated/prisma/client";
import jwt from "jsonwebtoken";
import { getRouteXp } from "@/lib/route";
import { addRouteToFeaturedSlide } from "@/lib/tvSlideHelpers";

const LOCATIONS: string[] = Object.values(Locations);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret =
      process.env.JWT_SECRET ||
      process.env.AUTH_SECRET ||
      "your-secret-key-change-in-production";
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, jwtSecret) as { userId: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });
    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.ROUTE_SETTER)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = (body.title?.trim() || "unnamed") as string;
    const grade = body.grade;
    const color = body.color;
    const location = body.location;
    const type = body.type;
    const x = body.x;
    const y = body.y;

    if (
      typeof grade !== "string" ||
      !grade.trim() ||
      typeof color !== "string" ||
      !color.trim() ||
      typeof location !== "string" ||
      !LOCATIONS.includes(location) ||
      (type !== "BOULDER" && type !== "ROPE") ||
      typeof x !== "number" ||
      typeof y !== "number"
    ) {
      return NextResponse.json(
        { message: "Missing or invalid: grade, color, location, type, x, y" },
        { status: 400 }
      );
    }

    const routeXp = getRouteXp(grade);
    const gradeLower = grade.toLowerCase();
    const isFeaturedGrade =
      gradeLower === "vfeature" ||
      gradeLower === "5.feature" ||
      gradeLower === "competition";

    const maxOrder = await prisma.route.aggregate({
      where: { location: location as Locations },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const createdRoute = await prisma.route.create({
      data: {
        title,
        grade: grade.trim(),
        setDate: new Date(),
        order,
        location: location as Locations,
        type: type as RouteType,
        color: color.trim(),
        xp: routeXp,
        createdByUserID: decoded.userId,
        isArchive: false,
        x,
        y,
        bonusXp: isFeaturedGrade ? 200 : 0,
      },
    });

    if (isFeaturedGrade) {
      await addRouteToFeaturedSlide(createdRoute.id, createdRoute.grade);
    }

    return NextResponse.json({
      data: {
        id: createdRoute.id,
        title: createdRoute.title,
        grade: createdRoute.grade,
        color: createdRoute.color,
        type: createdRoute.type,
        location: createdRoute.location,
        x: createdRoute.x,
        y: createdRoute.y,
      },
    });
  } catch (error) {
    console.error("Create route error:", error);
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 }
    );
  }
}
