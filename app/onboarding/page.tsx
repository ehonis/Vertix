"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ElementLoadingAnimation from "../ui/general/element-loading-animation";
import { countryCodes, getDefaultCountry, type CountryCode } from "@/utils/countryCodes";

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(getDefaultCountry());
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form state - auto-filled from OAuth data
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phoneNumber: "",
    email: "",
  });

  // Check if user signed up with phone number (has phoneNumber in session)
  // For web users, we'll check if they have a phoneNumber field
  // OAuth/Email users won't have phoneNumber initially
  const isPhoneUser = session?.user && (session.user as any).phoneNumber;

  // Load user data from session
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setFormData({
        name: session.user.name || "",
        username: session.user.username || "",
        phoneNumber: (session.user as any).phoneNumber ? "" : "", // Start empty for all users
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCountryDropdown]);

  // Format phone number as (xxx) xxx-xxxx
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Limit to 10 digits (US format)
    const limitedDigits = digits.slice(0, 10);

    // Apply formatting
    if (limitedDigits.length === 0) return "";
    if (limitedDigits.length <= 3) return `(${limitedDigits}`;
    if (limitedDigits.length <= 6)
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  };

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

    // Phone number is only required if user signed up with phone
    // For OAuth/Email users, phone is optional
    if (formData.phoneNumber.trim()) {
      // Validate phone number (digits only, no country code needed)
      const phoneRegex = /^\d{10}$/;
      const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
      }
    } else if (isPhoneUser) {
      // Phone users must provide phone number
      newErrors.phoneNumber = "Phone number is required";
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
      // Build request body - only include phoneNumber if provided
      const requestBody: {
        name: string;
        username: string;
        phoneNumber?: string;
      } = {
        name: formData.name.trim(),
        username: formData.username.trim(),
      };

      // Only include phone number if provided
      if (formData.phoneNumber.trim()) {
        requestBody.phoneNumber = `${selectedCountry.dialCode}${formData.phoneNumber.replace(/\D/g, "")}`;
      }

      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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

      // Force session update to refresh isOnboarded status
      await update();

      // Redirect to /redirect which will check onboarding status and redirect appropriately
      // This ensures the session is properly refreshed with the updated isOnboarded status
      router.push("/redirect");
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
                Phone Number {isPhoneUser ? "*" : "(optional)"}
              </label>
              <div className="flex gap-2">
                {/* Country Code Selector */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="bg-gray-700 text-white rounded-lg px-3 py-2 font-barlow focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 min-w-[100px] justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{selectedCountry.flag}</span>
                      <span className="text-sm">{selectedCountry.dialCode}</span>
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showCountryDropdown && (
                    <div className="absolute z-50 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto w-64">
                      {countryCodes.map(country => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowCountryDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3 text-white font-barlow"
                        >
                          <span className="text-xl">{country.flag}</span>
                          <span className="flex-1">{country.name}</span>
                          <span className="text-gray-400">{country.dialCode}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Phone Number Input */}
                <input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={e => {
                    // Strip all non-digits and format
                    const formatted = formatPhoneNumber(e.target.value);
                    setFormData({ ...formData, phoneNumber: formatted });
                  }}
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 font-barlow focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                  maxLength={14} // (xxx) xxx-xxxx = 14 characters
                  required={isPhoneUser}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-400 text-sm mt-1 font-barlow">{errors.phoneNumber}</p>
              )}
              <p className="text-gray-500 text-xs mt-1 font-barlow">
                {isPhoneUser
                  ? "Enter your phone number without the country code"
                  : "Optionally add your phone number for account recovery"}
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
