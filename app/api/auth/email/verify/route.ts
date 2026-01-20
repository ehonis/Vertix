import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and code are required" },
                { status: 400 }
            );
        }

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();

        // Find verification code
        const verification = await prisma.emailVerificationCode.findUnique({
            where: { email: normalizedEmail },
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
            await prisma.emailVerificationCode.update({
                where: { email: normalizedEmail },
                data: { attempts: verification.attempts + 1 },
            });
            return NextResponse.json(
                { error: "Invalid verification code" },
                { status: 400 }
            );
        }

        // Code is valid - find or create user
        let user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user) {
            // Create new user with email
            user = await prisma.user.create({
                data: {
                    email: normalizedEmail,
                    emailVerified: new Date(),
                    isOnboarded: false,
                },
            });
        }

        // Delete verification code
        await prisma.emailVerificationCode.delete({
            where: { email: normalizedEmail },
        });

        // Create JWT token using AUTH_SECRET
        const jwtSecret = process.env.AUTH_SECRET;
        if (!jwtSecret) {
            throw new Error("AUTH_SECRET not configured");
        }

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
                phoneNumber: user.phoneNumber,
                isOnboarded: user.isOnboarded,
                name: user.name,
                username: user.username,
                image: user.image,
                role: user.role,
                highestRopeGrade: user.highestRopeGrade,
                highestBoulderGrade: user.highestBoulderGrade,
                totalXp: user.totalXp,
            },
        });
    } catch (error: any) {
        console.error("Email verification error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to verify code" },
            { status: 500 }
        );
    }
}

