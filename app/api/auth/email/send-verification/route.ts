import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/prisma";
import { randomInt } from "crypto";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Generate 6-digit verification code
    const verificationCode = randomInt(100000, 999999).toString();

    // Store verification code in database with 10 minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailVerificationCode.upsert({
      where: { email: normalizedEmail },
      update: {
        code: verificationCode,
        expiresAt,
        attempts: 0,
      },
      create: {
        email: normalizedEmail,
        code: verificationCode,
        expiresAt,
        attempts: 0,
      },
    });

    // Send email via Resend
    await resend.emails.send({
      from: "Vertix <no-reply@vertixclimb.com>",
      to: normalizedEmail,
      subject: "Your Vertix verification code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 24px;">Verify your email</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Enter this code to sign in to Vertix:
          </p>
          <div style="background-color: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${verificationCode}</span>
          </div>
          <p style="color: #888; font-size: 14px; line-height: 1.5;">
            This code expires in 10 minutes. If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Verification code sent successfully",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send verification code" },
      { status: 500 }
    );
  }
}

