import { NextRequest, NextResponse } from "next/server";
import { addManualBounty } from "@/lib/bounties";

function isManualBountyRunEnabled() {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ENABLE_DEV_BOUNTY_RUN === "true";
}

export async function POST(req: NextRequest) {
  try {
    if (!isManualBountyRunEnabled()) {
      return NextResponse.json({ error: "Manual bounty add is disabled" }, { status: 403 });
    }

    const { routeId } = await req.json();
    if (!routeId || typeof routeId !== "string") {
      return NextResponse.json({ error: "routeId is required" }, { status: 400 });
    }

    const result = await addManualBounty(routeId);
    if (!result.created) {
      if (result.reason === "ALREADY_ACTIVE") {
        return NextResponse.json(
          { created: false, alreadyActive: true, reason: result.reason },
          { status: 409 }
        );
      }
      return NextResponse.json({ created: false, reason: result.reason }, { status: 404 });
    }

    return NextResponse.json({
      created: true,
      bounty: result.bounty,
    });
  } catch (error) {
    console.error("Error adding manual bounty:", error);
    return NextResponse.json({ error: "Failed to add manual bounty" }, { status: 500 });
  }
}
