import { NextRequest, NextResponse } from "next/server";
import { fillMissingBounties } from "@/lib/bounties";

function isAuthorizedCronRequest(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorizedCronRequest(req)) {
      return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
    }

    const summary = await fillMissingBounties();

    return NextResponse.json({
      message: "Route bounties generated",
      createdCount: summary.createdCount,
      rope: summary.rope,
      boulder: summary.boulder,
    });
  } catch (error) {
    console.error("Error creating route bounties:", error);
    return NextResponse.json({ error: "Failed to create route bounties" }, { status: 500 });
  }
}
