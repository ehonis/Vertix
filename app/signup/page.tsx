"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AuthShell from "@/app/ui/auth/auth-shell";
import SignupCard from "@/app/ui/auth/signup-card";

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace("/redirect");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-black">
        <span className="font-barlow text-sm text-white/50">Loading...</span>
      </main>
    );
  }

  if (isSignedIn) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-black">
        <span className="font-barlow text-sm text-white/50">Redirecting...</span>
      </main>
    );
  }

  return (
    <AuthShell
      mode="signup"
      heading={
        <>
          Sign up for <span className="font-jost text-white">Vertix</span>
        </>
      }
      subtitle="Create your account and start tracking climbs, routes, and competitions."
      hint="Sign up with email for a one-time code, or continue with Apple or Google. No passwords."
      hintLinkText="Log in"
      hintLinkHref="/signin"
    >
      <SignupCard />
    </AuthShell>
  );
}
