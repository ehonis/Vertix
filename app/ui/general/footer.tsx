"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
export default function Footer() {
  // Get the current pathname
  const pathname = usePathname();

  // Don't render the footer if we're on a scroller page
  if (pathname?.includes("scroller")) {
    return null;
  }

  return (
    // The footer will be positioned at the bottom of the content
    // mt-auto ensures it pushes to the bottom of the flex container
    <footer className="bg-black text-white py-2">
      <div className="container mx-auto px-3">
        <p className="text-start text-sm text-gray-500">© 2025 Vertix</p>
        {/* <p>
          <Link href="/terms" className="text-gray-400 text-sm">
            Terms
          </Link>
        </p> */}
      </div>
    </footer>
  );
}
