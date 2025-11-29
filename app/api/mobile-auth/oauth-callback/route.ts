import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const callbackUrl = searchParams.get("callbackUrl") || "vertixmobile://auth";

    // Get the session after OAuth callback (using NextAuth just for OAuth flow)
    const session = await auth();

    if (!session?.user) {
      const errorUrl = new URL(callbackUrl);
      errorUrl.searchParams.set("error", "authentication_failed");
      return NextResponse.redirect(errorUrl.toString());
    }

    const user = session.user;

    // Fetch full user data
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        role: true,
      },
    });

    if (!fullUser) {
      const errorUrl = new URL(callbackUrl);
      errorUrl.searchParams.set("error", "user_not_found");
      return NextResponse.redirect(errorUrl.toString());
    }

    // Create JWT token for mobile app (independent of NextAuth)
    const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET || "your-secret-key-change-in-production";
    const token = jwt.sign(
      {
        userId: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
        username: fullUser.username,
      },
      jwtSecret,
      { expiresIn: "30d" }
    );

    // Redirect to mobile app with token
    const mobileUrl = new URL(callbackUrl);
    mobileUrl.searchParams.set("token", token);
    mobileUrl.searchParams.set("user", encodeURIComponent(JSON.stringify(fullUser)));
    
    return NextResponse.redirect(mobileUrl.toString());
  } catch (error: any) {
    console.error("Mobile OAuth callback error:", error);
    const errorUrl = new URL(
      req.nextUrl.searchParams.get("callbackUrl") || "vertixmobile://auth"
    );
    errorUrl.searchParams.set("error", error.message || "callback_failed");
    return NextResponse.redirect(errorUrl.toString());
  }
}

