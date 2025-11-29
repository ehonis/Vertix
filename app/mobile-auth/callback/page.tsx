"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function MobileAuthCallback() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const user = searchParams.get("user");
  const error = searchParams.get("error");

  useEffect(() => {
    // Construct the deep link URL
    const params = new URLSearchParams();
    if (token) params.set("token", token);
    if (user) params.set("user", user);
    if (error) params.set("error", error);

    const deepLink = `vertixmobile://auth${params.toString() ? `?${params.toString()}` : ""}`;

    // Try to open the deep link
    window.location.href = deepLink;

    // Fallback: Show message if deep link doesn't work
    setTimeout(() => {
      const message = error
        ? `Authentication error: ${error}. Please return to the app.`
        : token
          ? "Authentication successful! Please return to the app."
          : "Please return to the app to complete authentication.";

      if (document.body) {
        document.body.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; padding: 20px; text-align: center;">
            <h1 style="font-size: 24px; margin-bottom: 20px;">${message}</h1>
            <p style="color: #666; margin-bottom: 20px;">If you don't return to the app automatically, please close this window and return to the Vertix app.</p>
          </div>
        `;
      }
    }, 1000);
  }, [token, user, error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "system-ui",
      }}
    >
      <p>Redirecting to app...</p>
    </div>
  );
}
