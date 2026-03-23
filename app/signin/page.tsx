"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AuthShell from "@/app/ui/auth/auth-shell";
import LoginCard from "@/app/ui/auth/login-card";

export default function SignInPage() {
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
      mode="signin"
      heading={
        <>
          Log in to <span className="font-jost text-white">Vertix</span>
        </>
      }
      subtitle="Use a one-time code sent to your email, or continue with Github or Google."
      hint="If you sign in with email, we'll send a short code. New users are created automatically."
      hintLinkText="Sign up"
      hintLinkHref="/signup"
      footer={
        <>
          Having trouble logging in? Email{" "}
          <a
            href="mailto:support@vertixclimb.com"
            className="text-blue-400 underline hover:text-blue-300"
          >
            support@vertixclimb.com
          </a>
        </>
      }
    >
      <LoginCard />
    </AuthShell>
  );
}
