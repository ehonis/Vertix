"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RouteChromeSync() {
  const pathname = usePathname() || "";

  useEffect(() => {
    const body = document.body;
    const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");

    body.classList.toggle("auth-route", isAuthPage);

    return () => {
      body.classList.remove("auth-route");
    };
  }, [pathname]);

  return null;
}
