import Link from 'next/link';
import { signIn } from '@/auth';
import SignOut from '../ui/sign-out-button';

export default function SignInForm() {
  return (
    <div className="flex items-center flex-col justify-center min-h-screen -translate-y-[6rem]">
      <h1 className="text-3xl text-white font-bold m-5">Login</h1>
      <div className="bg-bg1 flex flex-col items-center justify-center p-5 w-96 rounded-lg shadow-md gap-3">
        <form
          action={async () => {
            'use server';
            await signIn('github', { redirectTo: '/profile' });
          }}
        >
          <button
            type="submit"
            className="bg-bg2 w-max gap-3 items-center p-2 rounded text-white flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 0C5.373 0 0 5.373 0 12c0 5.304 3.438 9.804 8.205 11.388.6.111.82-.261.82-.58 0-.287-.01-1.046-.016-2.053-3.338.727-4.042-1.607-4.042-1.607-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.109-.775.418-1.305.76-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.47-2.382 1.236-3.22-.124-.303-.535-1.521.117-3.171 0 0 1.008-.322 3.3 1.23a11.518 11.518 0 013.003-.404c1.018.005 2.043.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.655 1.65.243 2.868.119 3.171.769.838 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.479 5.92.43.372.812 1.102.812 2.222 0 1.604-.015 2.898-.015 3.293 0 .321.217.696.825.579C20.565 21.797 24 17.297 24 12c0-6.627-5.373-12-12-12z"
                clipRule="evenodd"
              />
            </svg>
            Sign in with GitHub
          </button>
        </form>
        <SignOut />
      </div>

      <p className="text-white mt-5 mb-2">Need an Account?</p>
      <Link href={'/login'}>
        <button className="bg-green-400 w-max p-2 rounded text-white font-bold ">
          <span>Create an Account</span>
        </button>
      </Link>
    </div>
  );
}
