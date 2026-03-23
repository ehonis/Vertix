import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  mode: "signin" | "signup";
  heading: ReactNode;
  subtitle: string;
  hint: string;
  hintLinkText: string;
  hintLinkHref: string;
  children: ReactNode;
  footer?: ReactNode;
};

const glowColors = {
  signin: {
    topLeft: "rgba(59,130,246,0.55)",
    bottomRight: "rgba(130,0,219,0.45)",
  },
  signup: {
    topLeft: "rgba(16,185,129,0.5)",
    bottomRight: "rgba(59,130,246,0.45)",
  },
};

export default function AuthShell({
  mode,
  heading,
  subtitle,
  hint,
  hintLinkText,
  hintLinkHref,
  children,
  footer,
}: AuthShellProps) {
  const glow = glowColors[mode];

  return (
    <main className="relative min-h-[100svh] w-full overflow-hidden bg-black">
      {/* ── glow orbs ── */}
      <div
        className="glow-orb animate-glow-pulse"
        style={{
          width: 520,
          height: 520,
          left: "-140px",
          top: "-160px",
          background: glow.topLeft,
        }}
      />
      <div
        className="glow-orb animate-glow-pulse"
        style={{
          width: 560,
          height: 560,
          right: "-180px",
          bottom: "-220px",
          background: glow.bottomRight,
          animationDelay: "0.8s",
        }}
      />

      {/* ── centred wrapper ── */}
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1120px] items-center px-5 py-8 sm:py-10">
        <div className="w-full">
          {/* back link */}
          <div className="mb-7 animate-fade-up">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
              Back
            </Link>
          </div>

          {/* two-column grid */}
          <div className="grid w-full items-center gap-8 lg:grid-cols-2">
            {/* ── left: branding / copy ── */}
            <section className="animate-fade-up">
              <h1 className="font-jost text-4xl font-bold leading-tight tracking-tight sm:text-5xl text-white">
                {heading}
              </h1>
              <p className="mt-4 max-w-[44ch] font-barlow text-[15px] leading-6 text-white/50">
                {subtitle}
              </p>

              <div
                className={`mt-6 h-px w-full bg-gradient-to-r from-transparent ${mode === "signin" ? "via-blue-500/25" : "via-emerald-500/25"} to-transparent`}
              />

              <p className="mt-6 max-w-[52ch] font-barlow text-[13px] leading-5 text-white/35">
                {hint}
              </p>

              <p className="mt-6 font-barlow text-sm text-white/50">
                {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                <Link
                  href={hintLinkHref}
                  className={`${mode === "signin" ? "text-blue-400" : "text-emerald-400"} hover:underline`}
                >
                  {hintLinkText}
                </Link>
              </p>
            </section>

            {/* ── right: auth card ── */}
            <div className="animate-scale-in">{children}</div>
          </div>

          {/* optional footer text */}
          {footer && (
            <div className="mt-8 text-center font-barlow text-xs text-white/35">{footer}</div>
          )}
        </div>
      </div>
    </main>
  );
}
