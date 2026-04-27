"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RouteChromeSync() {
  const pathname = usePathname() || "";

  useEffect(() => {
    const body = document.body;
    const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");
    const isTvPage = pathname.startsWith("/tv");
    const isMapEditorPage = pathname.startsWith("/admin/map-editor");
    const isRouteManagerPage = pathname.startsWith("/admin/manager/routes");
    const hideChrome = isAuthPage || isTvPage || isMapEditorPage || isRouteManagerPage;

    body.classList.toggle("chrome-hidden-route", hideChrome);

    return () => {
      body.classList.remove("chrome-hidden-route");
    };
  }, [pathname]);

  return null;
}
