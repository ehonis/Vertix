import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

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

    // Get base URL
    const host = req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const baseUrl = `${protocol}://${host}`;

    // Set up the callback URL for NextAuth
    // We'll pass the mobile callback URL as a query param that NextAuth's redirect callback can read
    const nextAuthCallbackUrl = new URL("/api/auth/callback/" + provider, baseUrl);
    nextAuthCallbackUrl.searchParams.set("mobileCallback", encodeURIComponent(callbackUrl));

    // Build OAuth authorization URL directly using NextAuth's client IDs
    let authUrl: string;

    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error("GOOGLE_CLIENT_ID not configured");
      }
      
      // Generate state for CSRF protection
      const state = randomBytes(32).toString("base64url");
      
      const redirectUri = encodeURIComponent(nextAuthCallbackUrl.toString());
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=openid%20profile%20email&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${encodeURIComponent(state)}`;
        
    } else if (provider === "github") {
      const clientId = process.env.GITHUB_CLIENT_ID;
      if (!clientId) {
        throw new Error("GITHUB_CLIENT_ID not configured");
      }
      
      const state = randomBytes(32).toString("base64url");
      const redirectUri = encodeURIComponent(nextAuthCallbackUrl.toString());
      
      authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=user:email&` +
        `state=${encodeURIComponent(state)}`;
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
