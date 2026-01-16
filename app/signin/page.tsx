"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import ElementLoadingAnimation from "../ui/general/element-loading-animation";

type AuthStep = "initial" | "signin" | "signup";

export default function SignInForm() {
  const [step, setStep] = useState<AuthStep>("initial");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { redirectTo: "/redirect" });
    } catch (error) {
      console.error(error);
      setIsGoogleLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsGithubLoading(true);
    try {
      await signIn("github", { redirectTo: "/redirect" });
    } catch (error) {
      console.error(error);
      setIsGithubLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsEmailLoading(true);
    try {
      await signIn("resend", {
        email: email.trim(),
        redirectTo: "/redirect",
        callbackUrl: "/redirect",
      });
      setEmailSent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleBack = () => {
    setStep("initial");
  };

  // Initial step: Choose Sign In or Create Account
  if (step === "initial") {
    return (
      <div className="flex items-center flex-col justify-center mt-16">
        <h1 className="text-3xl text-white font-bold m-5 z-10">Welcome to Vertix</h1>
        <div className="bg-slate-900 flex flex-col items-center justify-center p-5 px-10 md:w-96 w-80 rounded-lg shadow-md gap-4 z-10">
          <button
            onClick={() => setStep("signin")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-barlow font-semibold py-3 px-4 rounded-full transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => setStep("signup")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-barlow font-semibold py-3 px-4 rounded-full transition-colors"
          >
            Create Account
          </button>
          <div className="h-0.5 w-full bg-white/30 rounded-sm my-2" />
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleGoogleSignIn}
              className="w-full"
              disabled={isGoogleLoading || isGithubLoading}
            >
              {!isGoogleLoading ? (
                <div className="w-full flex items-center justify-between gap-3 p-2 rounded-full text-white bg-white outline-black outline-2 font-barlow font-medium border">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-6 md:size-8 bg-white rounded-full"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    ></path>
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    ></path>
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                  </svg>
                  <p className="font-barlow text-black font-bold md:text-lg text-base">
                    Continue with Google
                  </p>
                  <div className="md:w-6 w-4" />
                </div>
              ) : (
                <div className="bg-white rounded-full w-full flex justify-center py-2">
                  <ElementLoadingAnimation size={7} />
                </div>
              )}
            </button>
            <button
              onClick={handleGithubSignIn}
              className="w-full"
              disabled={isGoogleLoading || isGithubLoading}
            >
              {!isGithubLoading ? (
                <div className="bg-black w-full flex items-center justify-between gap-3 p-2 rounded-full text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-6 md:size-8"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 0C5.373 0 0 5.373 0 12c0 5.304 3.438 9.804 8.205 11.388.6.111.82-.261.82-.58 0-.287-.01-1.046-.016-2.053-3.338.727-4.042-1.607-4.042-1.607-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.109-.775.418-1.305.76-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.47-2.382 1.236-3.22-.124-.303-.535-1.521.117-3.171 0 0 1.008-.322 3.3 1.23a11.518 11.518 0 013.003-.404c1.018.005 2.043.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.655 1.65.243 2.868.119 3.171.769.838 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.479 5.92.43.372.812 1.102.812 2.222 0 1.604-.015 2.898-.015 3.293 0 .321.217.696.825.579C20.565 21.797 24 17.297 24 12c0-6.627-5.373-12-12-12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="font-barlow font-bold md:text-lg text-base">Continue with GitHub</p>
                  <div className="w-4" />
                </div>
              ) : (
                <div className="bg-slate-900 rounded-full w-full flex justify-center py-2">
                  <ElementLoadingAnimation size={7} />
                </div>
              )}
            </button>
          </div>
        </div>
        <p className="text-center italic font-barlow text-white text-xs mt-5 z-10">
          Having trouble logging in? Please reach out by emailing{" "}
          <a
            href="mailto:support@vertixclimb.com"
            className="underline text-blue-500 hover:text-blue-400"
          >
            support@vertixclimb.com
          </a>
        </p>
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: "radial-gradient(circle at top left, #8200DB 0%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: "radial-gradient(circle at bottom right, #1447E6 0%, transparent 75%)",
          }}
        />
      </div>
    );
  }

  // Sign In or Sign Up step: Show Google sign-in (phone input will be added later)
  return (
    <div className="flex items-center flex-col justify-center mt-16">
      <h1 className="text-3xl text-white font-bold m-5 z-10">
        {step === "signin" ? "Sign In" : "Create Account"}
      </h1>
      <div className="bg-slate-900 flex flex-col items-center justify-center p-5 px-10 md:w-96 w-80 rounded-lg shadow-md gap-4 z-10">
        <button
          onClick={handleBack}
          className="self-start text-white/70 hover:text-white font-barlow text-sm mb-2"
        >
          ← Back
        </button>

        {/* Email Sign In */}
        <form onSubmit={handleEmailSignIn} className="w-full">
          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="email" className="text-white font-barlow text-sm">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setEmailSent(false);
              }}
              placeholder="your@email.com"
              className="bg-gray-700 text-white rounded-lg md:px-4 px-3 md:py-3 py-2 font-barlow focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isEmailLoading}
            />
          </div>
          {emailSent ? (
            <div className="bg-green-900/50 border border-green-500 text-green-200 rounded-lg px-4 py-3 mb-4 font-barlow text-sm">
              Check your email for a magic link to sign in!
            </div>
          ) : (
            <button
              type="submit"
              disabled={isEmailLoading || !email.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-barlow font-semibold md:py-3 py-2 md:px-4 px-3 rounded-full transition-colors mb-4"
            >
              {isEmailLoading ? (
                <div className="flex justify-center">
                  <ElementLoadingAnimation size={7} />
                </div>
              ) : (
                <p className="font-barlow font-semibold md:text-lg text-base">Sign In with Email</p>
              )}
            </button>
          )}
        </form>

        <div className="h-0.5 w-full bg-white/30 rounded-sm my-2" />

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleGoogleSignIn}
            className="w-full"
            disabled={isGoogleLoading || isGithubLoading}
          >
            {!isGoogleLoading ? (
              <div className="w-full flex items-center justify-between gap-3 p-2 rounded-full text-white bg-white outline-black outline-2 font-barlow font-medium border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6 md:size-8 bg-white rounded-full"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
                <p className="font-barlow text-black font-bold md:text-lg text-base">
                  Continue with Google
                </p>
                <div className="md:w-6 w-4" />
              </div>
            ) : (
              <div className="bg-white rounded-full w-full flex justify-center py-2">
                <ElementLoadingAnimation size={7} />
              </div>
            )}
          </button>
          <button
            onClick={handleGithubSignIn}
            className="w-full"
            disabled={isGoogleLoading || isGithubLoading}
          >
            {!isGithubLoading ? (
              <div className="bg-black w-full flex items-center justify-between gap-3 p-2 rounded-full text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6 md:size-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 0C5.373 0 0 5.373 0 12c0 5.304 3.438 9.804 8.205 11.388.6.111.82-.261.82-.58 0-.287-.01-1.046-.016-2.053-3.338.727-4.042-1.607-4.042-1.607-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.109-.775.418-1.305.76-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.47-2.382 1.236-3.22-.124-.303-.535-1.521.117-3.171 0 0 1.008-.322 3.3 1.23a11.518 11.518 0 013.003-.404c1.018.005 2.043.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.655 1.65.243 2.868.119 3.171.769.838 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.479 5.92.43.372.812 1.102.812 2.222 0 1.604-.015 2.898-.015 3.293 0 .321.217.696.825.579C20.565 21.797 24 17.297 24 12c0-6.627-5.373-12-12-12z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-barlow font-bold md:text-lg text-base">Continue with GitHub</p>
                <div className="md:w-6 w-4" />
              </div>
            ) : (
              <div className="bg-slate-900 rounded-full w-full flex justify-center py-2">
                <ElementLoadingAnimation size={7} />
              </div>
            )}
          </button>
        </div>
      </div>
      <p className="text-center italic font-barlow text-white text-xs mt-5 z-10">
        Having trouble logging in? Please reach out by emailing{" "}
        <a
          href="mailto:support@vertixclimb.com"
          className="underline text-blue-500 hover:text-blue-400"
        >
          support@vertixclimb.com
        </a>
      </p>
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(circle at top left, #8200DB 0%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(circle at bottom right, #1447E6 0%, transparent 75%)",
        }}
      />
    </div>
  );
}
