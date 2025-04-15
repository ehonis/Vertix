import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { parseDateString } from "@/lib/dates";
import { Locations, RouteType } from "@prisma/client";
import { CompetitionStatus } from "@prisma/client";

type compData = {
  id: string;
  title: string;
  compType: string;
  status: CompetitionStatus;
  selectedDate: string;
  type: string;
};
type routeData = {
  id: string;
  title: string;
  setDate: string;
  grade: string;
  color: string;
  wall: Locations;
  type: string;
};

function isRouteData(item: compData | routeData): item is routeData {
  return (
    typeof item === 'object' &&
    item !== null &&
    'setDate' in item &&
    'grade' in item &&
    'color' in item &&
    'wall' in item
  );
}

// Type guard for compData
function isCompData(item: compData | routeData): item is compData {
  return (
    typeof item === 'object' &&
    item !== null &&
    'compType' in item &&
    'status' in item &&
    'selectedDate' in item
  );
}

export async function POST(request: NextRequest) {
  try {
    const res = await request.json();

    const data: (routeData | compData)[] = res;

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

          // Create a route in the database
          return prisma.route.create({
            data: {
              title: element.title,
              grade: element.grade,
              type: routeType,
              color: element.color,
              setDate: dateObject,
              location: element.wall,
            },
          });
        } else if (isCompData(element)) {
          if (element.compType === "Mixer") {
            const dateObject = parseDateString(element.selectedDate);
            const year = dateObject.getFullYear();
            
            return prisma.mixerCompetition.create({
              data: {
                name: element.title,
                year: year,
                status: CompetitionStatus.INACTIVE,
              },
            });
          }
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
