import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, code } = await req.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: "Phone number and code are required" },
        { status: 400 }
      );
    }

    // Find verification code
    const verification = await prisma.verificationCode.findUnique({
      where: { phoneNumber },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Verification code not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Check attempts
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many attempts. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify code
    if (verification.code !== code) {
      await prisma.verificationCode.update({
        where: { phoneNumber },
        data: { attempts: verification.attempts + 1 },
      });
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Code is valid - find or create user
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      // Create new user with phone number
      user = await prisma.user.create({
        data: {
          phoneNumber,
          email: `${phoneNumber.replace(/\+/g, '')}@phone.local`, // Temporary email for phone-only users
          isOnboarded: false,
        },
      });
    }

    // Delete verification code
    await prisma.verificationCode.delete({
      where: { phoneNumber },
    });

    // Create JWT token using AUTH_SECRET
    const jwtSecret = process.env.AUTH_SECRET;
    if (!jwtSecret) {
      throw new Error("AUTH_SECRET not configured");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        phoneNumber: user.phoneNumber,
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
        phoneNumber: user.phoneNumber,
        isOnboarded: user.isOnboarded,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
        highestRopeGrade: user.highestRopeGrade,
        highestBoulderGrade: user.highestBoulderGrade,
        totalXp: user.totalXp,
      },
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify code" },
      { status: 500 }
    );
  }
}

