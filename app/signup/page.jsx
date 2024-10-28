'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signup } from '@/app/actions/auth';

export default function SignupForm() {
  const [state, action] = useFormState(signup, undefined);

  return (
    <div className="flex items-center flex-col justify-center min-h-screen -translate-y-[6rem]">
      <h1 className="text-3xl text-white font-bold m-5">Sign up!</h1>
      <form
        className="bg-bg1 flex flex-col items-center justify-center p-5 w-96 rounded-lg shadow-md"
        action={action}
      >
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            placeholder="Name"
            className="mt-1 p-2 w-full border rounded"
          />
        </div>
        {state?.errors?.name && <p>{state.errors.name}</p>}
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
        {state?.errors?.email && <p>{state.errors.email}</p>}
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
        {state?.errors?.password && (
          <div>
            <p className="text-red-500">Password must:</p>
            <ul className="mb-2">
              {state.errors.password.map((error) => (
                <li key={error} className="text-red-500">
                  - {error}
                </li>
              ))}
            </ul>
          </div>
        )}
        <SubmitButton />
      </form>
      <p className="text-white mt-5 mb-2">Already have an account?</p>
      <button className="bg-green-400 w-20 p-2 rounded text-white font-bold ">
        Login
      </button>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="bg-blue-400 w-40 p-2 rounded text-white"
    >
      Sign Up
    </button>
  );
}
