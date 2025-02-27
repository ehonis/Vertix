import { signIn } from '@/auth';

export default function SignInForm() {
  return (
    <div className="flex items-center flex-col justify-center mt-16">
      <h1 className="text-3xl text-white font-bold m-5">Login or Sign Up</h1>
      <div className="bg-bg1 flex flex-col items-center justify-center p-5 w-96 rounded-lg shadow-md gap-3">
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/profile' });
          }}
        >
          <button
            type="submit"
            className=" w-max gap-3 items-center p-2 rounded text-black bg-white flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            Sign in/up with Google
          </button>
        </form>

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
            Sign in/up with GitHub
          </button>
        </form>

        <form
          action={async (formData) => {
            'use server';
            await signIn('resend', formData);
          }}
        >
          <input type="text" name="email" placeholder="Email" />
          <button type="submit">Signin with Resend</button>
        </form>
      </div>
    </div>
  );
}
