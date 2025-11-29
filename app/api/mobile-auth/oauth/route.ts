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
    const nextAuthSignInUrl = `${baseUrl}/api/auth/signin/${provider}`;
    
    // Add callbackUrl as a query param that NextAuth can use
    // We'll store the mobile callback in a cookie and retrieve it in the redirect callback
    const signInUrl = new URL(nextAuthSignInUrl);
    signInUrl.searchParams.set("callbackUrl", callbackUrl);

    // Create redirect response with cookie for mobile callback URL
    // Store mobile callback URL in cookies so we can retrieve it after OAuth
    const response = NextResponse.redirect(signInUrl.toString());
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
