import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";

// For OAuth token verification
async function verifyGoogleToken(accessToken: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    if (!response.ok) {
      throw new Error("Invalid Google token");
    }
    return await response.json();
  } catch (error) {
    console.error("Google token verification error:", error);
    throw error;
  }
}

async function verifyGithubToken(accessToken: string) {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) {
      throw new Error("Invalid GitHub token");
    }
    return await response.json();
  } catch (error) {
    console.error("GitHub token verification error:", error);
    throw error;
  }
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, accessToken, email, method } = body;

    // Handle email magic link
    if (method === "email" && email) {
      // For email magic links, we'll send an email with a deep link
      // The deep link will contain a one-time token that can be verified
      // For now, we'll create a verification token and send it via email
      // You'll need to implement email sending logic here
      
      // Generate a one-time token
      const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET || "your-secret-key-change-in-production";
      const verificationToken = jwt.sign(
        { email, type: "email_verification" },
        jwtSecret,
        { expiresIn: "1h" }
      );

      // TODO: Send email with magic link
      // The magic link should be: vertixmobile://auth?token={verificationToken}
      // You can use your existing email service (Resend, etc.)
      
      return NextResponse.json({
        message: "Magic link sent to your email",
      });
    }

    // Handle OAuth providers
    if (!provider || !accessToken) {
      return NextResponse.json(
        { error: "Provider and accessToken are required" },
        { status: 400 }
      );
    }

    let userInfo: any;
    let emailAddress: string;

    if (provider === "google") {
      userInfo = await verifyGoogleToken(accessToken);
      emailAddress = userInfo.email;
    } else if (provider === "github") {
      userInfo = await verifyGithubToken(accessToken);
      emailAddress = await getGithubEmail(accessToken);
      if (!emailAddress) {
        emailAddress = userInfo.email || `${userInfo.id}@github.local`;
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      );
    }

    if (!emailAddress) {
      return NextResponse.json(
        { error: "Could not retrieve email from provider" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: emailAddress },
    });

    if (!user) {
      // Create new user - set isOnboarded to false for onboarding flow
      user = await prisma.user.create({
        data: {
          email: emailAddress,
          name: userInfo.name || userInfo.login || null,
          image: userInfo.picture || userInfo.avatar_url || null,
          username: userInfo.login || null,
          isOnboarded: false, // New users need to complete onboarding
        },
      });

      // Create account link
      await prisma.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: provider,
          providerAccountId: userInfo.id.toString(),
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
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: provider,
            providerAccountId: userInfo.id.toString(),
          },
        },
        update: {
          access_token: accessToken,
        },
        create: {
          userId: user.id,
          type: "oauth",
          provider: provider,
          providerAccountId: userInfo.id.toString(),
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

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        image: user.image,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Mobile sign in error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

