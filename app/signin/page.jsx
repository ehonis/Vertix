'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import ElementLoadingAnimation from '../ui/general/element-loading-animation';
export default function SignInForm() {
  const [isGoogleLoading, setIsGoogleloading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);

  const [emailString, setEmailString] = useState('');

  const handleSignIn = async (provider) => {
    if (provider === 'google') {
      setIsGoogleloading(true);
    } else if (provider === 'github') {
      setIsGithubLoading(true);
    } else {
      setIsMagicLinkLoading(true);
    }

    try {
      if (provider === 'resend') {
        await signIn('resend', { email: emailString, redirectTo: '/redirect' });
      } else {
        await signIn(provider, { redirectTo: '/redirect' });
      }
    } catch (error) {
      console.error(error);
    }
    if (provider === 'google') {
      setIsGoogleloading(false);
    } else if (provider === 'github') {
      setIsGithubLoading(false);
    } else {
      setIsMagicLinkLoading(false);
    }
  };
  return (
    <div className="flex items-center flex-col justify-center mt-16">
      <h1 className="text-3xl text-white font-bold m-5">Login or Sign Up</h1>
      <div className="bg-bg2 flex flex-col items-center justify-center p-5 px-10 md:w-96 w-80 rounded-lg shadow-md gap-3">
        <div className="flex flex-col gap-4 w-full">
          <button onClick={() => handleSignIn('google')}>
            {!isGoogleLoading ? (
              <div className=" w-full gap-3 items-center p-2 rounded-full text-white bg-white/25 outline-white outline grid grid-cols-3 font-barlow font-medium border-black ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-8 bg-white rounded-full"
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
                <p className="font-barlow font-bold text-lg">Google</p>
              </div>
            ) : (
              <div className="bg-white rounded-full w-full flex justify-center py-2">
                <ElementLoadingAnimation size={7} />
              </div>
            )}
          </button>

          <button onClick={() => handleSignIn('github')}>
            {!isGithubLoading ? (
              <div className="bg-black/35 w-full grid grid-cols-3 gap-3 items-center p-2 rounded-full text-white outline outline-black ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 0C5.373 0 0 5.373 0 12c0 5.304 3.438 9.804 8.205 11.388.6.111.82-.261.82-.58 0-.287-.01-1.046-.016-2.053-3.338.727-4.042-1.607-4.042-1.607-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.109-.775.418-1.305.76-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.47-2.382 1.236-3.22-.124-.303-.535-1.521.117-3.171 0 0 1.008-.322 3.3 1.23a11.518 11.518 0 013.003-.404c1.018.005 2.043.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.655 1.65.243 2.868.119 3.171.769.838 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.479 5.92.43.372.812 1.102.812 2.222 0 1.604-.015 2.898-.015 3.293 0 .321.217.696.825.579C20.565 21.797 24 17.297 24 12c0-6.627-5.373-12-12-12z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-barlow font-bold text-lg">GitHub</p>
              </div>
            ) : (
              <div className="bg-bg1 rounded-full w-full flex justify-center py-2">
                <ElementLoadingAnimation size={7} />
              </div>
            )}
          </button>
        </div>
        <div className="h-1 w-full bg-white rounded-sm" />
        <div className="flex flex-col gap-3 w-full">
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={emailString}
            onChange={(e) => setEmailString(e.target.value)}
            className="text-white bg-bg1 rounded-sm px-2 py-1 font-barlow text-lg focus:outline-hidden"
          />
          <button
            onClick={() => handleSignIn('resend')}
            className="bg-linear-to-l from-purple-500/35 to-purple-700/35 outline-purple-600 outline px-4 py-1 text-white font-barlow font-semibold rounded-full"
          >
            {!isMagicLinkLoading ? (
              <div className="rounded-full flex justify-between">
                <p>Send Magic Link</p>
                <svg
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                  strokeWidth={0.75}
                  className="fill-white size-6"
                >
                  <g id="Layer_2" data-name="Layer 2">
                    <g id="invisible_box" data-name="invisible box">
                      <rect width="48" height="48" fill="none" />
                    </g>
                    <g id="Layer_7" data-name="Layer 7">
                      <g>
                        <path d="M29.3,15.9a3,3,0,0,0-4.3,0L3.9,37A3.1,3.1,0,0,0,3,39.2a2.7,2.7,0,0,0,.9,2.1l2.8,2.8a2.9,2.9,0,0,0,2.1.9,3.1,3.1,0,0,0,2.2-.9L32.1,23a3.1,3.1,0,0,0,.9-2.2,2.7,2.7,0,0,0-.9-2.1ZM8.8,40.6,7.4,39.2,21.2,25.3l1.5,1.5ZM25.5,23.9l-1.4-1.4,3.1-3.1,1.4,1.4Z" />
                        <path d="M38,13V11h2a2,2,0,0,0,0-4H38V5a2,2,0,0,0-4,0V7H32a2,2,0,0,0,0,4h2v2a2,2,0,0,0,4,0Z" />
                        <path d="M43,22H42V21a2,2,0,0,0-4,0v1H37a2,2,0,0,0,0,4h1v1a2,2,0,0,0,4,0V26h1a2,2,0,0,0,0-4Z" />
                        <path d="M16,13h1v1a2,2,0,0,0,4,0V13h1a2,2,0,0,0,0-4H21V8a2,2,0,0,0-4,0V9H16a2,2,0,0,0,0,4Z" />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
            ) : (
              <div className="bg-purple-500 rounded-full w-44 flex justify-center py-2">
                <ElementLoadingAnimation size={7} />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
