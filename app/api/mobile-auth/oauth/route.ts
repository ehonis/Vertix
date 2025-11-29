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

    // Redirect to NextAuth's sign-in endpoint
    // NextAuth will handle the OAuth flow and redirect to our callback
    const callbackUrlForNextAuth = new URL("/api/mobile-auth/callback", req.nextUrl.origin);
    callbackUrlForNextAuth.searchParams.set("callbackUrl", callbackUrl);

    // Use NextAuth's built-in sign-in endpoint with callback
    const signInUrl = new URL(`/api/auth/signin/${provider}`, req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", callbackUrlForNextAuth.toString());
    
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
