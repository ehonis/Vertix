import { NextResponse } from "next/server";
import { fillMissingBounties } from "@/lib/bounties";

function isManualBountyRunEnabled() {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ENABLE_DEV_BOUNTY_RUN === "true";
}

export async function POST() {
  try {
    if (!isManualBountyRunEnabled()) {
      return NextResponse.json({ error: "Manual bounty run is disabled" }, { status: 403 });
    }

    const summary = await fillMissingBounties();
    return NextResponse.json({
      message: "Manual bounty run complete",
      createdCount: summary.createdCount,
      rope: summary.rope,
      boulder: summary.boulder,
    });
  } catch (error) {
    console.error("Error running manual bounty fill:", error);
    return NextResponse.json({ error: "Failed to run bounty fill" }, { status: 500 });
  }
}
