"use client";

import { usePathname } from "next/navigation";

export default function NavBarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.includes("map-editor") || pathname?.includes("manager/routes")) {
    return null;
  }

  return <>{children}</>;
}
