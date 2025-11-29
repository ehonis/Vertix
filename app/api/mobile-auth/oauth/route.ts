import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";
import { auth } from "@/auth";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const provider = searchParams.get("provider");
    const callbackUrl = searchParams.get("callbackUrl") || "vertixmobile://auth";

    if (!provider || (provider !== "google" && provider !== "github")) {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    // Check if we have a session (user just completed OAuth)
    const session = await auth();
    
    if (session?.user) {
      // User is authenticated, create mobile token and redirect
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

      // Create JWT token for mobile app
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
    }

    // No session yet, redirect to OAuth sign-in
    // The callback will come back to /api/mobile-auth/oauth-callback
    const signInCallbackUrl = new URL("/api/mobile-auth/oauth-callback", req.nextUrl.origin);
    signInCallbackUrl.searchParams.set("callbackUrl", callbackUrl);
    signInCallbackUrl.searchParams.set("provider", provider);

    // Redirect to NextAuth sign-in (we use NextAuth just for the OAuth flow, not for session management)
    const signInUrl = new URL(`/api/auth/signin/${provider}`, req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", signInCallbackUrl.toString());
    
    return NextResponse.redirect(signInUrl.toString());
  } catch (error: any) {
    console.error("Mobile OAuth error:", error);
    const errorUrl = new URL(
      req.nextUrl.searchParams.get("callbackUrl") || "vertixmobile://auth"
    );
    errorUrl.searchParams.set("error", error.message || "oauth_failed");
    return NextResponse.redirect(errorUrl.toString());
  }
}

