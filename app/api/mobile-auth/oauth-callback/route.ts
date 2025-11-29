import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";

async function exchangeGoogleCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; id_token?: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  return await response.json();
}

async function exchangeGithubCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ access_token: string }> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth not configured");
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub token exchange failed: ${error}`);
  }

  return await response.json();
}

async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return await response.json();
}

async function getGithubUserInfo(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user info");
  }

  return await response.json();
}

async function getGithubEmail(accessToken: string) {
  try {
    const response = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const emails = await response.json();
    const primaryEmail = emails.find((email: any) => email.primary);
    return primaryEmail?.email || emails[0]?.email || null;
  } catch (error) {
    console.error("GitHub email fetch error:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const callbackUrl = searchParams.get("callbackUrl") || "vertixmobile://auth";
    const provider = searchParams.get("provider");

    if (error) {
      const errorUrl = new URL(callbackUrl);
      errorUrl.searchParams.set("error", error);
      return NextResponse.redirect(errorUrl.toString());
    }

    if (!code || !provider) {
      const errorUrl = new URL(callbackUrl);
      errorUrl.searchParams.set("error", "missing_code_or_provider");
      return NextResponse.redirect(errorUrl.toString());
    }

    // Exchange code for access token
    const redirectUri = new URL("/api/mobile-auth/oauth-callback", req.nextUrl.origin);
    redirectUri.searchParams.set("callbackUrl", callbackUrl);
    redirectUri.searchParams.set("provider", provider);

    let accessToken: string;
    let userInfo: any;

    if (provider === "google") {
      const tokenData = await exchangeGoogleCodeForToken(code, redirectUri.toString());
      accessToken = tokenData.access_token;
      userInfo = await getGoogleUserInfo(accessToken);
    } else if (provider === "github") {
      const tokenData = await exchangeGithubCodeForToken(code, redirectUri.toString());
      accessToken = tokenData.access_token;
      userInfo = await getGithubUserInfo(accessToken);
      // Get email separately for GitHub
      const email = await getGithubEmail(accessToken);
      if (email) {
        userInfo.email = email;
      }
    } else {
      const errorUrl = new URL(callbackUrl);
      errorUrl.searchParams.set("error", "unsupported_provider");
      return NextResponse.redirect(errorUrl.toString());
    }

    if (!userInfo.email) {
      const errorUrl = new URL(callbackUrl);
      errorUrl.searchParams.set("error", "no_email");
      return NextResponse.redirect(errorUrl.toString());
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name || userInfo.login || null,
          image: userInfo.picture || userInfo.avatar_url || null,
          username: userInfo.login || null,
        },
      });

      // Create account link
      await prisma.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: provider,
          providerAccountId: userInfo.id?.toString() || userInfo.sub || "",
          access_token: accessToken,
        },
      });
    } else {
      // Update user info if needed
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name || userInfo.name || userInfo.login || null,
          image: user.image || userInfo.picture || userInfo.avatar_url || null,
        },
      });

      // Update or create account link
      const providerAccountId = userInfo.id?.toString() || userInfo.sub || "";
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: provider,
            providerAccountId: providerAccountId,
          },
        },
        update: {
          access_token: accessToken,
        },
        create: {
          userId: user.id,
          type: "oauth",
          provider: provider,
          providerAccountId: providerAccountId,
          access_token: accessToken,
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
    const mobileUrl = new URL(callbackUrl);
    mobileUrl.searchParams.set("token", token);
    mobileUrl.searchParams.set("user", encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      image: user.image,
      role: user.role,
    })));
    
    return NextResponse.redirect(mobileUrl.toString());
  } catch (error: any) {
    console.error("Mobile OAuth callback error:", error);
    const errorUrl = new URL(
      req.nextUrl.searchParams.get("callbackUrl") || "vertixmobile://auth"
    );
    errorUrl.searchParams.set("error", error.message || "callback_failed");
    return NextResponse.redirect(errorUrl.toString());
  }
}
