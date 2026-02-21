import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

function isManualBountyRunEnabled() {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ENABLE_DEV_BOUNTY_RUN === "true";
}

export async function GET(req: NextRequest) {
  try {
    if (!isManualBountyRunEnabled()) {
      return NextResponse.json({ error: "Manual bounty status is disabled" }, { status: 403 });
    }

    const routeId = req.nextUrl.searchParams.get("routeId");
    if (!routeId) {
      return NextResponse.json({ error: "routeId is required" }, { status: 400 });
    }

    const activeBounty = await prisma.bounty.findFirst({
      where: {
        routeId,
        isActive: true,
        claimedAt: null,
      },
      select: {
        id: true,
        startedAt: true,
      },
    });

    return NextResponse.json({
      hasActiveBounty: !!activeBounty,
      activeBounty,
    });
  } catch (error) {
    console.error("Error fetching bounty status:", error);
    return NextResponse.json({ error: "Failed to fetch bounty status" }, { status: 500 });
  }
}
