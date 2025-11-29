import { NextRequest, NextResponse } from "next/server";
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

    // No session yet, we need to initiate OAuth flow
    // Build the OAuth authorization URL directly
    const callbackUrlForOAuth = new URL("/api/mobile-auth/oauth-callback", req.nextUrl.origin);
    callbackUrlForOAuth.searchParams.set("callbackUrl", callbackUrl);
    callbackUrlForOAuth.searchParams.set("provider", provider);

    let authUrl: string;

    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error("GOOGLE_CLIENT_ID not configured");
      }
      const redirectUri = encodeURIComponent(callbackUrlForOAuth.toString());
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=consent`;
    } else if (provider === "github") {
      const clientId = process.env.GITHUB_CLIENT_ID;
      if (!clientId) {
        throw new Error("GITHUB_CLIENT_ID not configured");
      }
      const redirectUri = encodeURIComponent(callbackUrlForOAuth.toString());
      authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    } else {
      throw new Error("Unsupported provider");
    }
    
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Mobile OAuth error:", error);
    const errorUrl = new URL(
      req.nextUrl.searchParams.get("callbackUrl") || "vertixmobile://auth"
    );
    errorUrl.searchParams.set("error", error.message || "oauth_failed");
    return NextResponse.redirect(errorUrl.toString());
  }
}
