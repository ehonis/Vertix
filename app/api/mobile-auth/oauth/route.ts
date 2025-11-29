import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";

// Generate PKCE code verifier and challenge
function generatePKCE() {
  // Generate code_verifier: random URL-safe string, 43-128 characters
  const codeVerifier = randomBytes(32).toString("base64url");
  
  // Generate code_challenge: SHA256 hash of verifier, base64url encoded
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  
  return { codeVerifier, codeChallenge };
}

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

    // Get base URL from request (works with preview deployments)
    // Use the actual host from the request, not hardcoded production URL
    const host = req.headers.get("host") || req.headers.get("x-forwarded-host");
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const baseUrl = `${protocol}://${host}`;

    // Generate PKCE parameters
    const { codeVerifier, codeChallenge } = generatePKCE();

    // Use our mobile callback URL directly (must be added to OAuth console)
    // This allows us to handle PKCE manually without NextAuth interference
    const mobileCallbackUrl = `${baseUrl}/api/mobile-auth/callback/${provider}`;

    // Build OAuth authorization URL with PKCE
    let authUrl: string;
    const state = randomBytes(32).toString("base64url");

    if (provider === "google") {
      const clientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error("GOOGLE_CLIENT_ID not configured");
      }
      
      const redirectUri = encodeURIComponent(mobileCallbackUrl);
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=openid%20profile%20email&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${encodeURIComponent(state)}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;
        
    } else if (provider === "github") {
      // Use mobile-specific GitHub OAuth app credentials
      const clientId = process.env.MOBILE_GITHUB_CLIENT_ID || process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID;
      if (!clientId) {
        throw new Error("MOBILE_GITHUB_CLIENT_ID not configured");
      }
      
      const redirectUri = encodeURIComponent(mobileCallbackUrl);
      
      authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=user:email&` +
        `state=${encodeURIComponent(state)}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;
    } else {
      throw new Error("Unsupported provider");
    }

    // Create redirect response with cookies
    // Store PKCE verifier and mobile callback URL in cookies
    const response = NextResponse.redirect(authUrl);
    
    // Store PKCE code verifier (needed for token exchange)
    response.cookies.set(`pkce_verifier_${provider}`, codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });
    
    // Store state for CSRF protection
    response.cookies.set(`oauth_state_${provider}`, state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    
    // Store mobile callback URL
    response.cookies.set(`mobile_callback_${provider}`, callbackUrl, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
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
