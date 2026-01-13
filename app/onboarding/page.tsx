"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ElementLoadingAnimation from "../ui/general/element-loading-animation";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state - auto-filled from OAuth data
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phoneNumber: "",
    email: "",
  });

  // Load user data from session
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setFormData({
        name: session.user.name || "",
        username: session.user.username || "",
        phoneNumber: "",
        email: session.user.email || "",
      });
    }
  }, [session, status]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, underscores, and hyphens";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      // Basic phone validation (E.164 format)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ""))) {
        newErrors.phoneNumber =
          "Please enter a valid phone number with country code (e.g., +1234567890)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          username: formData.username.trim(),
          phoneNumber: formData.phoneNumber.replace(/\s/g, ""),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.field) {
          setErrors({ [error.field]: error.message });
        } else {
          setErrors({ submit: error.message || "Failed to complete onboarding" });
        }
        setIsLoading(false);
        return;
      }

      // Refresh session to get updated user data
      await signIn(undefined, { redirect: false });

      // Redirect to home/dashboard
      router.push("/");
    } catch (error) {
      console.error("Onboarding error:", error);
      setErrors({ submit: "An unexpected error occurred" });
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <ElementLoadingAnimation size={7} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl text-white font-bold mb-2 font-barlow">Complete Your Profile</h1>
          <p className="text-gray-400 mb-6 font-barlow">
            We need a few more details to get you started
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-white text-sm font-barlow mb-2">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 font-barlow focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
                required
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1 font-barlow">{errors.name}</p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-white text-sm font-barlow mb-2">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 font-barlow focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choose a username"
                required
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1 font-barlow">{errors.username}</p>
              )}
              <p className="text-gray-500 text-xs mt-1 font-barlow">
                Letters, numbers, underscores, and hyphens only
              </p>
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="phoneNumber" className="block text-white text-sm font-barlow mb-2">
                Phone Number *
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 font-barlow focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 123-4567"
                required
              />
              {errors.phoneNumber && (
                <p className="text-red-400 text-sm mt-1 font-barlow">{errors.phoneNumber}</p>
              )}
              <p className="text-gray-500 text-xs mt-1 font-barlow">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            {/* Email (read-only, from OAuth) */}
            <div>
              <label htmlFor="email" className="block text-white text-sm font-barlow mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="w-full bg-gray-800 text-gray-400 rounded-lg px-4 py-2 font-barlow cursor-not-allowed"
              />
              <p className="text-gray-500 text-xs mt-1 font-barlow">
                Email from your OAuth account
              </p>
            </div>

            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                <p className="text-red-400 text-sm font-barlow">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-barlow font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <ElementLoadingAnimation size={4} />
                </div>
              ) : (
                "Complete Setup"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
