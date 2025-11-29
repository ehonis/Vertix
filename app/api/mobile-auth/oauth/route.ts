import { NextRequest, NextResponse } from "next/server";

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
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.vertixclimb.com";

    // Use NextAuth's built-in sign-in endpoint which handles PKCE automatically
    // This will properly initiate the OAuth flow with PKCE code verifier
    // DO NOT pass the mobile callback URL as a query param - NextAuth will reject it
    // We'll store it in a cookie instead and retrieve it in the redirect callback
    const nextAuthSignInUrl = `${baseUrl}/api/auth/signin/${provider}`;

    // Create redirect response with cookie for mobile callback URL
    // Store mobile callback URL in cookies so we can retrieve it after OAuth
    const response = NextResponse.redirect(nextAuthSignInUrl);
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
