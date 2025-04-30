import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { StandingsType } from "@prisma/client";
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { compId, standingsType } = await req.json();
        let standingsTypeTemp;
        if(standingsType === ""){
            standingsTypeTemp = null;
        } else {
            standingsTypeTemp = standingsType as StandingsType;
        }

         await prisma.mixerCompetition.update({
            where: { id: compId },
            data: { standingsType: standingsTypeTemp },
        });
        
        return NextResponse.json({ message: "Standings type updated" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}