"use client";
import { useClerk } from "@clerk/nextjs";

export default function SignOut() {
  const { signOut } = useClerk();

  return (
    <button
      className="w-max bg-red-500/50 outline outline-red-500 rounded-sm p-2 text-white font-barlow font-bold text-sm"
      onClick={() => signOut({ redirectUrl: "/" })}
    >
      Sign Out
    </button>
  );
}
