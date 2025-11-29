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

    // Redirect to page component that uses Server Action to call signIn
    // This is necessary because signIn modifies cookies, which can only be done
    // in Server Actions or Route Handlers, but we need PKCE which signIn handles
    const pageUrl = new URL("/mobile-auth/oauth", baseUrl);
    pageUrl.searchParams.set("provider", provider);
    pageUrl.searchParams.set("callbackUrl", callbackUrl);
    
    return NextResponse.redirect(pageUrl.toString());
  } catch (error: any) {
    console.error("Mobile OAuth error:", error);
    const errorUrl = new URL(
      req.nextUrl.searchParams.get("callbackUrl") || "vertixmobile://auth"
    );
    errorUrl.searchParams.set("error", error.message || "oauth_failed");
    return NextResponse.redirect(errorUrl.toString());
  }
}
