import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { parseDateString } from "@/lib/dates";
import { Locations, RouteType } from "@/generated/prisma/client";
import { addRouteToFeaturedSlide } from "@/lib/tvSlideHelpers";
import type { LegacyLocationKey } from "@/lib/wallLocations";

type routeData = {
  id: string;
  title: string;
  setDate: string;
  grade: string;
  color: string;
  wall: LegacyLocationKey;
  type: string;
};

function isRouteData(item: unknown): item is routeData {
  return (
    typeof item === "object" &&
    item !== null &&
    "setDate" in item &&
    "grade" in item &&
    "color" in item &&
    "wall" in item
  );
}

export async function POST(request: NextRequest) {
  try {
    const res = await request.json();

    const data: unknown[] = res;

    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No data to commit", status: 500 });
    }

    // Use Promise.all to handle async operations for all elements

    console.log(data);
    const results = await Promise.all(
      data.map(async element => {
        if (isRouteData(element)) {
          let routeType: RouteType;
          if (element.grade.startsWith("v")) {
            routeType = RouteType.BOULDER;
          } else {
            routeType = RouteType.ROPE;
          }

          const dateObject = parseDateString(element.setDate);
          const isFeaturedGrade =
            element.grade.toLowerCase() === "vfeature" ||
            element.grade.toLowerCase() === "5.feature";

          // Create a route in the database
          const createdRoute = await prisma.route.create({
            data: {
              title: element.title,
              grade: element.grade,
              type: routeType,
              color: element.color,
              setDate: dateObject,
              location: element.wall as Locations,
              bonusXp: isFeaturedGrade ? 200 : 0, // Set bonus XP for featured routes
            },
          });

          // Add to featured route slide if it's a featured grade route
          if (isFeaturedGrade) {
            await addRouteToFeaturedSlide(createdRoute.id, createdRoute.grade);
          }

          return createdRoute;
        }
      })
    );

    // Return success response
    return NextResponse.json({
      message: "Content successfully added",
      results,
    });
  } catch (error) {
    console.error("Error committing routes:", error);
    return NextResponse.json({
      message: "An error occurred",
      status: 500,
    });
  }
}
