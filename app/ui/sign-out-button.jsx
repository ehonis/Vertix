'use client';
import { signOut } from 'next-auth/react';

export default function SignOut() {
  return (
    <button
      className="w-max bg-red-500 rounded p-2"
      onClick={() => signOut({ redirectTo: '/' })}
    >
      Sign Out
    </button>
  );
}
