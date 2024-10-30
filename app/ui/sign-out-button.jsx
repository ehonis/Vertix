import { signOut } from '@/auth';

export default function SignOut() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/' });
      }}
    >
      <button type="submit" className="w-max bg-red-500 rounded p-2">
        Sign Out
      </button>
    </form>
  );
}
