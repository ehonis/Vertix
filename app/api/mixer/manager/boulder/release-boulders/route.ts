import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { ClimberStatus, Route, RouteType, MixerBoulder } from "@prisma/client";
import { Locations } from "@prisma/client";
import { isGradeHigher } from "@/lib/route";

export async function POST(req: NextRequest)  {
    const session = await auth();

    if(!session){
        return NextResponse.json({ message: "Not Authenicated" },{ status: 403 });
    }
    if(session.user.role !== "ADMIN"){
        return NextResponse.json({ message: "Not Authorized" },{ status: 403 });
    }

  try {
    const {compId, boulders} : {compId: string, boulders: MixerBoulder[]} = await req.json();

    // Wrap all database operations in a transaction
    const result = await prisma.$transaction(async (tx) => {
        // Check if competition exists
        const comp = await tx.mixerCompetition.findUnique({
            where: {
                id: compId
            }
        });

        if(!comp){
            throw new Error("Competition not found");
        }

        // Create a map to store the relationship between mixer route IDs and created route IDs
        const boulderIdMap = new Map<string, string>();

        const formattedBoulders : Route[] = boulders.map(boulder => ({
            title: `${comp.name} Boulder ${boulder.points}`,
            grade: boulder.grade || 'v0',
            color: boulder.color,
            location: Locations.boulderSouth,
            setDate: new Date(),
            type: RouteType.BOULDER,
            isArchive: false,
            id: boulder.id,
            createdByUserID: session.user.id || null,
            order: null
        }));

        // Create all routes and store them to get their IDs
        const createdBoulders = await Promise.all(
            formattedBoulders.map(boulder => 
                tx.route.create({
                    data: boulder
                })
            )
        );

        // Build the ID mapping
        createdBoulders.forEach(boulder => {
            boulderIdMap.set(boulder.id, boulder.id);
        });

        // Get completed climbers
        const completedClimbers = await tx.mixerClimber.findMany({
            where: {
                competitionId: compId,
                climberStatus: ClimberStatus.COMPLETED,
                userId: {
                    not: null
                }
            },
            include: {
                completions: true,
            }
        });

        // Store highest grades per user to avoid race conditions
        const userHighestGrades = new Map<string, string>();

        // Process all completions
        for (const climber of completedClimbers) {
            if (!climber.userId) continue;

            const user = await tx.user.findUnique({
                where: {
                    id: climber.userId
                },
                select: {
                    highestBoulderGrade: true,
                }
            });

            if (!user) {
                console.warn(`User not found for completion ${climber.id}`);
                continue;
            }

            // Initialize with user's current highest grade
            let currentHighestGrade = user.highestBoulderGrade || null;

            for (const completion of climber.completions) {
                // Get the corresponding route ID from our map
                const actualBoulderId = boulderIdMap.get(completion.mixerBoulderId!);
                
                if (!actualBoulderId) {
                    console.warn(`No matching boulder found for completion ${completion.id}`);
                    continue;
                }

                if (completion.isComplete) {
                    // Create route completion
                    const route = await tx.routeCompletion.create({
                        data: {
                            userId: climber.userId,
                            sends: completion.attempts || 1,
                            routeId: actualBoulderId
                        },
                        include: {
                            route: {
                                select: {
                                    grade: true
                                }
                            }
                        }
                    });

                    // Update highest grade if necessary
                    const newGrade = route.route.grade;
                    if (!currentHighestGrade || isGradeHigher(currentHighestGrade, newGrade, "boulder")) {
                        currentHighestGrade = newGrade;
                        console.log(`Found higher grade ${newGrade} for user ${climber.userId}`);
                    }
                } else {
                    // Create route attempt
                    await tx.routeAttempt.create({
                        data: {
                            userId: climber.userId,
                            routeId: actualBoulderId,
                            attempts: completion.attempts || 0
                        }
                    });
                }
            }

            // After processing all completions for this user, update their highest grade if it changed
            if (currentHighestGrade && (!user.highestBoulderGrade || isGradeHigher(user.highestBoulderGrade, currentHighestGrade, "boulder"))) {
                console.log(`Updating highest boulder grade for user ${climber.userId} from ${user.highestBoulderGrade || 'none'} to ${currentHighestGrade}`);
                await tx.user.update({
                    where: { id: climber.userId },
                    data: { highestBoulderGrade: currentHighestGrade }
                });
            }

            await tx.mixerCompetition.update({
                where: { id: compId },
                data: { isBouldersReleased: true }
            });
        }

        return { success: true };
    }, {
        timeout: 60000 // Increased timeout as a temporary measure or if optimization isn't enough
    });

    return NextResponse.json({ message: "Successfully created routes and processed completions" }, { status: 200 });
  } catch (error) {
    console.error("Transaction failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
