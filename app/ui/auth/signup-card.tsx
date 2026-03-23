"use client";

import { useMemo, useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "email" | "code";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function GithubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 .5C5.649.5.5 5.79.5 12.315c0 5.22 3.299 9.647 7.874 11.21.575.11.786-.257.786-.571 0-.282-.01-1.03-.016-2.021-3.203.714-3.879-1.592-3.879-1.592-.524-1.36-1.279-1.722-1.279-1.722-1.046-.734.079-.719.079-.719 1.157.084 1.765 1.218 1.765 1.218 1.028 1.807 2.697 1.285 3.354.982.104-.766.402-1.285.731-1.58-2.556-.299-5.244-1.314-5.244-5.847 0-1.292.449-2.348 1.185-3.176-.119-.299-.513-1.505.112-3.137 0 0 .967-.318 3.168 1.213a10.74 10.74 0 0 1 2.885-.399c.979.004 1.966.137 2.886.399 2.199-1.53 3.164-1.213 3.164-1.213.627 1.632.233 2.838.115 3.137.738.828 1.183 1.884 1.183 3.176 0 4.544-2.692 5.544-5.255 5.838.414.37.783 1.102.783 2.222 0 1.605-.015 2.9-.015 3.293 0 .317.207.686.792.569 4.571-1.565 7.866-5.991 7.866-11.209C23.5 5.79 18.351.5 12 .5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#EA4335"
        d="M12 10.182v3.873h5.381c-.236 1.244-.945 2.298-2.008 3.005l3.246 2.518c1.891-1.744 2.981-4.309 2.981-7.36 0-.707-.064-1.387-.182-2.036H12Z"
      />
      <path
        fill="#34A853"
        d="M12 21.818c2.7 0 4.963-.891 6.617-2.409l-3.246-2.518c-.891.6-2.026.964-3.371.964-2.6 0-4.799-1.754-5.588-4.109H3.066v2.6A9.996 9.996 0 0 0 12 21.818Z"
      />
      <path
        fill="#4A90E2"
        d="M6.412 13.746a5.994 5.994 0 0 1 0-3.491v-2.6H3.066a9.996 9.996 0 0 0 0 8.691l3.346-2.6Z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.145c1.472 0 2.791.509 3.836 1.499l2.873-2.873C16.954 3.127 14.691 2.182 12 2.182a9.996 9.996 0 0 0-8.934 5.473l3.346 2.6C7.201 7.899 9.4 6.145 12 6.145Z"
      />
    </svg>
  );
}

function extractError(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const list = (err as { errors: Array<{ message?: string }> }).errors;
    if (list?.[0]?.message) return list[0].message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export default function SignupCard() {
  const { signUp, errors: clerkErrors } = useSignUp();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const emailOk = useMemo(() => isValidEmail(email.trim()), [email]);
  const canRequest = emailOk && !pending;
  const canVerify = otp.trim().length >= 4 && emailOk && !pending;

  // Surface Clerk-level errors
  const fieldErr =
    clerkErrors?.fields?.emailAddress?.message ?? clerkErrors?.fields?.code?.message ?? null;
  const globalErr = clerkErrors?.global?.[0]?.message ?? null;
  const clerkError = fieldErr ?? globalErr ?? null;

  async function onSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!emailOk || !signUp) return;

    setPending(true);
    try {
      // Step 1: create a sign-up with the email
      const createResult = await signUp.create({ emailAddress: email.trim() });
      if (createResult.error) {
        setError(createResult.error.message ?? "Failed to start sign-up");
        return;
      }

      // Step 2: send verification email code
      const sendResult = await signUp.verifications.sendEmailCode();
      if (sendResult.error) {
        setError(sendResult.error.message ?? "Failed to send verification code");
        return;
      }

      setStep("code");
      setInfo("Code sent. Check your inbox.");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setPending(false);
    }
  }

  async function onVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!signUp) return;

    setPending(true);
    try {
      const verifyResult = await signUp.verifications.verifyEmailCode({
        code: otp.trim(),
      });
      if (verifyResult.error) {
        setError(verifyResult.error.message ?? "Invalid code");
        return;
      }

      // If status is complete, finalize to activate the session
      if (signUp.status === "complete") {
        const finalizeResult = await signUp.finalize();
        if (finalizeResult.error) {
          setError(finalizeResult.error.message ?? "Failed to finalize sign-up");
          return;
        }
        router.push("/redirect");
      } else {
        // Might need onboarding or additional fields
        router.push("/redirect");
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setPending(false);
    }
  }

  async function onSocial(strategy: "oauth_github" | "oauth_google") {
    setError(null);
    setInfo(null);
    if (!signUp) return;

    setPending(true);
    try {
      const result = await signUp.sso({
        strategy,
        redirectUrl: "/signup/sso-callback",
        redirectCallbackUrl: "/redirect",
      });
      if (result.error) {
        setError(result.error.message ?? "Social sign-up failed");
        setPending(false);
      }
    } catch (err) {
      setError(extractError(err));
      setPending(false);
    }
  }

  return (
    <section className="glass-card rounded-2xl p-6 text-white sm:p-8">
      <div>
        <h2 className="font-jost text-xl tracking-tight text-white">Create your account</h2>
        <p className="mt-1 font-barlow text-sm text-white/50">
          {step === "email"
            ? "Enter your email to get started."
            : "Enter the code we sent to verify."}
        </p>
      </div>

      <div className="mt-6">
        {/* ── social buttons ── */}
        <button
          type="button"
          onClick={() => onSocial("oauth_github")}
          disabled={pending}
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm transition hover:border-white/20 hover:bg-white/[0.04] disabled:opacity-50"
        >
          <GithubIcon />
          <span className="font-barlow text-[13px] text-white">Continue with GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => onSocial("oauth_google")}
          disabled={pending}
          className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm transition hover:border-white/20 hover:bg-white/[0.04] disabled:opacity-50"
        >
          <GoogleIcon />
          <span className="font-barlow text-[13px] text-white">Continue with Google</span>
        </button>

        {/* ── divider ── */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="font-barlow text-xs text-white/35">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* ── email step ── */}
        {step === "email" ? (
          <form onSubmit={onSendCode} className="space-y-3">
            <label className="block">
              <span className="mb-1 block font-barlow text-xs text-white/35">Email</span>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                inputMode="email"
                className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 font-barlow text-sm text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500/60"
              />
            </label>
            <button
              type="submit"
              disabled={!canRequest}
              className="w-full rounded-xl bg-[linear-gradient(135deg,#10b981,#3b82f6)] px-4 py-3 font-barlow text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {pending ? "Sending..." : "Send code"}
            </button>
          </form>
        ) : (
          /* ── code step ── */
          <form onSubmit={onVerifyCode} className="space-y-3">
            <label className="block">
              <span className="mb-1 block font-barlow text-xs text-white/35">Email</span>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                inputMode="email"
                className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 font-barlow text-sm text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500/60"
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between gap-3">
                <span className="mb-1 block font-barlow text-xs text-white/35">Code</span>
                <button
                  type="button"
                  onClick={() => {
                    setOtp("");
                    setStep("email");
                    setError(null);
                    setInfo(null);
                  }}
                  className="font-barlow text-xs text-white/50 transition hover:text-white"
                >
                  Change email
                </button>
              </div>
              <input
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456"
                autoComplete="one-time-code"
                inputMode="numeric"
                className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 font-barlow text-sm tracking-[0.22em] text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500/60"
              />
            </label>

            <button
              type="submit"
              disabled={!canVerify}
              className="w-full rounded-xl bg-[linear-gradient(135deg,#10b981,#3b82f6)] px-4 py-3 font-barlow text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {pending ? "Verifying..." : "Verify & create account"}
            </button>

            <button
              type="button"
              disabled={!canRequest}
              onClick={onSendCode}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 font-barlow text-sm text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              Resend code
            </button>
          </form>
        )}

        {/* ── error / info banner ── */}
        {(error || clerkError || info) && (
          <div
            className={`mt-4 rounded-xl border px-3 py-2 font-barlow text-sm ${
              error || clerkError
                ? "border-red-500/35 bg-red-500/10 text-white"
                : "border-emerald-500/25 bg-emerald-500/10 text-white"
            }`}
          >
            {error ?? clerkError ?? info}
          </div>
        )}

        <p className="mt-5 font-barlow text-xs leading-5 text-white/35">
          By continuing, you agree to our{" "}
          <Link href="/terms-of-use" className="text-emerald-400 hover:underline">
            terms
          </Link>{" "}
          and acknowledge our{" "}
          <Link href="/privacy-policy" className="text-emerald-400 hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
