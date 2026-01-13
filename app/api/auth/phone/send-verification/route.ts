import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/prisma";
import { randomInt } from "crypto";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate E.164 format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = randomInt(100000, 999999).toString();

    // Store verification code in database with 10 minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationCode.upsert({
      where: { phoneNumber },
      update: {
        code: verificationCode,
        expiresAt,
        attempts: 0,
      },
      create: {
        phoneNumber,
        code: verificationCode,
        expiresAt,
        attempts: 0,
      },
    });

    // Send SMS via Twilio
    await twilioClient.messages.create({
      body: `Your Vertix verification code is: ${verificationCode}. This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return NextResponse.json({
      message: "Verification code sent successfully",
    });
  } catch (error: any) {
    console.error("Twilio error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send verification code" },
      { status: 500 }
    );
  }
}

