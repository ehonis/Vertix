"use server";

import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export async function initiateOAuth(provider: string, callbackUrl: string) {
  if (!provider || (provider !== "google" && provider !== "github")) {
    redirect("/signin?error=invalid_provider");
  }

  // Set up the callback URL for NextAuth
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://vertixclimb.com");
  
  const callbackUrlForNextAuth = new URL("/api/mobile-auth/callback", baseUrl);
  callbackUrlForNextAuth.searchParams.set("callbackUrl", callbackUrl);

  // Use NextAuth's signIn function - this will redirect to the OAuth provider
  await signIn(provider, {
    redirectTo: callbackUrlForNextAuth.toString(),
  });
}

