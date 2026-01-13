import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = req.nextUrl.searchParams;
    const cookies = req.cookies;
    
    // Get stored values from cookies
    const codeVerifier = cookies.get(`pkce_verifier_${provider}`)?.value;
    const state = cookies.get(`oauth_state_${provider}`)?.value;
    const callbackUrl = cookies.get(`mobile_callback_${provider}`)?.value || 
                       "vertixmobile://auth";
    
    // Get OAuth callback parameters
    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      const errorUrl = new URL(callbackUrl);
      errorUrl.searchParams.set("error", error);
      return NextResponse.redirect(errorUrl.toString());
    }

    // Validate state (CSRF protection)
    if (!state || state !== returnedState) {
      const errorUrl = new URL(callbackUrl);
      errorUrl.searchParams.set("error", "invalid_state");
      return NextResponse.redirect(errorUrl.toString());
    }

    if (!code || !codeVerifier) {
      const errorUrl = new URL(callbackUrl);
      errorUrl.searchParams.set("error", "missing_code_or_verifier");
      return NextResponse.redirect(errorUrl.toString());
    }

    // Exchange authorization code for access token using PKCE
    // Get base URL from request (works with preview deployments)
    const host = req.headers.get("host") || req.headers.get("x-forwarded-host");
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/mobile-auth/callback/${provider}`;
    
    let accessToken: string;
    let userInfo: any;

    if (provider === "google") {
      const clientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.AUTH_GOOGLE_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error("Google OAuth not configured");
      }

      // Exchange code for token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;

      // Get user info from Google
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user info from Google");
      }

      userInfo = await userResponse.json();
      
    } else if (provider === "github") {
      // Use mobile-specific GitHub OAuth app credentials
      const clientId = process.env.MOBILE_GITHUB_CLIENT_ID || process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.MOBILE_GITHUB_CLIENT_SECRET || process.env.AUTH_GITHUB_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error("Mobile GitHub OAuth not configured");
      }

      // Exchange code for token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;

      // Get user info from GitHub
      const userResponse = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user info from GitHub");
      }

      userInfo = await userResponse.json();
      
      // Get email from GitHub (may require separate API call)
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
        userInfo.email = primaryEmail?.email || userInfo.email;
      }
    } else {
      throw new Error("Unsupported provider");
    }

    if (!userInfo.email) {
      const errorUrl = new URL(callbackUrl);
      errorUrl.searchParams.set("error", "no_email");
      return NextResponse.redirect(errorUrl.toString());
    }

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      // Create new user - set isOnboarded to false for onboarding flow
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name || userInfo.login || null,
          image: userInfo.picture || userInfo.avatar_url || null,
          username: userInfo.login || null, // GitHub username
          emailVerified: new Date(),
          isOnboarded: false, // New users need to complete onboarding
        },
      });
    } else {
      // Update user info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: userInfo.name || userInfo.login || user.name,
          image: userInfo.picture || userInfo.avatar_url || user.image,
        },
      });
    }

    // Create JWT token for mobile app
    const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET || "your-secret-key-change-in-production";
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      jwtSecret,
      { expiresIn: "30d" }
    );

    // Redirect to mobile app with token
    // CRITICAL: The redirect URL must match EXACTLY what was passed to openAuthSessionAsync
    // iOS WebAuthenticationSession is very strict about this
    const baseCallbackUrl = callbackUrl.split('?')[0];
    
    // Build the redirect URL - must match exactly: vertixmobile://auth
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      image: user.image,
      role: user.role,
      highestRopeGrade: user.highestRopeGrade,
      highestBoulderGrade: user.highestBoulderGrade,
      totalXp: user.totalXp,
      isOnboarded: user.isOnboarded,
    };
    
    // Construct URL manually to ensure exact format
    // Include isOnboarded flag to redirect to onboarding if needed
    const redirectUrl = `${baseCallbackUrl}?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userData))}&isOnboarded=${user.isOnboarded}`;
    
    // Clear PKCE cookies
    // Use 302 redirect with the deep link URL
    const response = NextResponse.redirect(redirectUrl, { status: 302 });
    response.cookies.delete(`pkce_verifier_${provider}`);
    response.cookies.delete(`oauth_state_${provider}`);
    response.cookies.delete(`mobile_callback_${provider}`);
    
    return response;
  } catch (error: any) {
    console.error("Mobile OAuth callback error:", error);
    const errorUrl = new URL(
      req.nextUrl.searchParams.get("callbackUrl") || "vertixmobile://auth"
    );
    errorUrl.searchParams.set("error", error.message || "callback_failed");
    return NextResponse.redirect(errorUrl.toString());
  }
}

