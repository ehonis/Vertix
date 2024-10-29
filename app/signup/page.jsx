import Link from 'next/link';
import { signIn } from '@/auth';

export default function SignupForm() {
  return (
    <div className="flex items-center flex-col justify-center min-h-screen -translate-y-[6rem]">
      <h1 className="text-3xl text-white font-bold m-5">Sign up!</h1>
      <form
        className="bg-bg1 flex flex-col items-center justify-center p-5 w-96 rounded-lg shadow-md"
        action={action}
      >
        <div className="mb-4 flex-col flex">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white"
            >
              Username
            </label>
          </div>
          <div className="flex">
            <div className="w-8 text-white font-bold text-center rounded-l-md p-2 bg-bg2 border mt-1">
              @
            </div>
            <input
              id="username"
              name="username"
              placeholder="Username"
              className="mt-1 p-2 w-full border rounded-r"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            className="mt-1 p-2 w-full border rounded"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-white"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        <SubmitButton />
      </form>
      <p className="text-white mt-5 mb-2">Already have an account?</p>
      <Link href={'/login'}>
        <button className="bg-green-400 w-20 p-2 rounded text-white font-bold ">
          Login
        </button>
      </Link>
    </div>
  );
}

function SubmitButton() {
  return (
    <button type="submit" className="bg-blue-400 w-40 p-2 rounded text-white">
      Sign Up
    </button>
  );
}
