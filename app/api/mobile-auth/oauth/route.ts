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

    // Get base URL - use hardcoded production URL to ensure consistency
    // The redirect URI in Google OAuth console must match exactly
    // Must match: https://www.vertixclimb.com/api/auth/callback/google
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.vertixclimb.com";

    // Use NextAuth's standard callback URL (must match Google/GitHub OAuth console settings)
    // The redirect URI must be exactly: https://www.vertixclimb.com/api/auth/callback/google
    // (or /api/auth/callback/github for GitHub)
    // NO query parameters allowed - they will cause redirect_uri_mismatch
    const nextAuthCallbackUrl = `${baseUrl}/api/auth/callback/${provider}`;

    // Build OAuth authorization URL directly using NextAuth's client IDs
    let authUrl: string;

    if (provider === "google") {
      const clientId = process.env.AUTH_GOOGLE_ID;
      if (!clientId) {
        throw new Error("GOOGLE_CLIENT_ID not configured");
      }
      
      // Generate state for CSRF protection
      const state = randomBytes(32).toString("base64url");
      
      const redirectUri = encodeURIComponent(nextAuthCallbackUrl);
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=openid%20profile%20email&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${encodeURIComponent(state)}`;
        
    } else if (provider === "github") {
      const clientId = process.env.AUTH_GITHUB_ID;
      if (!clientId) {
        throw new Error("GITHUB_CLIENT_ID not configured");
      }
      
      const state = randomBytes(32).toString("base64url");
      const redirectUri = encodeURIComponent(nextAuthCallbackUrl);
      
      authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=user:email&` +
        `state=${encodeURIComponent(state)}`;
    } else {
      throw new Error("Unsupported provider");
    }

    // Create redirect response with cookie for mobile callback URL
    // Store mobile callback URL in cookies so we can retrieve it after OAuth
    // This way we don't modify the redirect URI that Google expects
    const response = NextResponse.redirect(authUrl);
    response.cookies.set(`mobile_callback_${provider}`, callbackUrl, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/", // Make sure cookie is accessible
    });
    
    return response;
  } catch (error: any) {
    console.error("Mobile OAuth error:", error);
    const errorUrl = new URL(
      req.nextUrl.searchParams.get("callbackUrl") || "vertixmobile://auth"
    );
    errorUrl.searchParams.set("error", error.message || "oauth_failed");
    return NextResponse.redirect(errorUrl.toString());
  }
}
