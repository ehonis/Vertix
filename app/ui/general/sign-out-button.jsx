'use client';
import { signOut } from 'next-auth/react';

export default function SignOut() {
  return (
    <button
      className="w-max bg-red-500 rounded-sm p-2 text-white font-barlow font-bold text-sm"
      onClick={() => signOut({ redirectTo: '/' })}
    >
      Sign Out
    </button>
  );
}
