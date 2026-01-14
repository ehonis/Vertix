import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    
    // Check for JWT token (mobile authentication)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
      
      if (jwtSecret) {
        try {
          const decoded = jwt.verify(token, jwtSecret) as { userId: string };
          userId = decoded.userId;
        } catch (jwtError) {
          // JWT verification failed, try NextAuth session
        }
      }
    }
    
    // If no JWT token, check for NextAuth session (web authentication)
    if (!userId) {
      const session = await auth();
      if (session?.user) {
        userId = session.user.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, username, phoneNumber, email } = await req.json();

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required", field: "name" },
        { status: 400 }
      );
    }

    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: "Username is required", field: "username" },
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, underscores, and hyphens", field: "username" },
        { status: 400 }
      );
    }

    // Phone number is optional - only validate if provided
    let cleanPhone: string | null = null;
    if (phoneNumber && typeof phoneNumber === 'string' && phoneNumber.trim()) {
      // Validate phone number format (E.164)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      const cleaned = phoneNumber.replace(/\s/g, "");
      if (!phoneRegex.test(cleaned)) {
        return NextResponse.json(
          { error: "Please enter a valid phone number with country code (e.g., +1234567890)", field: "phoneNumber" },
          { status: 400 }
        );
      }
      cleanPhone = cleaned;
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: "Username is already taken", field: "username" },
        { status: 400 }
      );
    }

    // Check if phone number is already taken (only if provided)
    if (cleanPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber: cleanPhone },
      });

      if (existingPhone && existingPhone.id !== userId) {
        return NextResponse.json(
          { error: "Phone number is already registered", field: "phoneNumber" },
          { status: 400 }
        );
      }
    }

    // Validate email if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: "Please enter a valid email address", field: "email" },
          { status: 400 }
        );
      }

      // Check if email is already taken (unless it's the current user's email)
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.trim() },
      });

      if (existingEmail && existingEmail.id !== userId) {
        return NextResponse.json(
          { error: "Email is already registered", field: "email" },
          { status: 400 }
        );
      }
    }

    // Update user with onboarding data
    const updateData: {
      name: string;
      username: string;
      phoneNumber?: string | null;
      email?: string;
      isOnboarded: boolean;
    } = {
      name: name.trim(),
      username: username.trim(),
      isOnboarded: true,
    };

    // Only update phone number if provided
    if (cleanPhone) {
      updateData.phoneNumber = cleanPhone;
    }

    // Only update email if provided (for account recovery, typically for phone-only users)
    if (email && email.trim()) {
      updateData.email = email.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Onboarding completed successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        phoneNumber: updatedUser.phoneNumber,
        isOnboarded: updatedUser.isOnboarded,
      },
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

