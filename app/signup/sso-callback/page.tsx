"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SignUpSSOCallbackPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-black">
      <span className="font-barlow text-sm text-white/50">Completing sign-up...</span>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/redirect"
        signInFallbackRedirectUrl="/redirect"
        signUpForceRedirectUrl="/redirect"
        signUpFallbackRedirectUrl="/redirect"
      />
    </main>
  );
}
