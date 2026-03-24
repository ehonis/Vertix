import { NextResponse } from "next/server";
import { getTvData } from "@/lib/tv";

export const dynamic = "force-dynamic";

export async function GET() {
  const {
    slides,
    monthlyLeaderBoardData,
    boulderGradeCounts,
    ropeGradeCounts,
    ropeTotal,
    boulderTotal,
  } = await getTvData();

  return NextResponse.json({
    slides,
    monthlyLeaderBoardData,
    boulderGradeCounts,
    ropeGradeCounts,
    ropeTotal,
    boulderTotal,
  });
}
