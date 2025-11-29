import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // For mobile apps, we just return success
    // The client should remove the token from secure storage
    return NextResponse.json({
      message: "Signed out successfully",
    });
  } catch (error: any) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}

