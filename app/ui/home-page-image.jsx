import TypewriterText from './typewriter';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
export default function HomePageImage(userObject) {
  const user = userObject?.user || null;
  return (
    <div className="relative flex justify-center items-center md:py-5 px-5 py-5">
      {/* Image */}
      <Image
        src="https://utfs.io/f/bujx12z5cHJjnX8NMSnpcauzN7DQ3P1mq0TdMXlHSOy5LReF"
        width={1280}
        height={720}
        className="rounded-t-xl object-cover"
        alt="Background"
      />

      {/* Gradient Overlay */}
      <div className="md:my-5 mx-5 my-5 absolute inset-0 bg-gradient-to-t from-bg0 via-transparent to-transparent rounded-t-xl opacity-100"></div>

      {/* Text Overlay */}
      <div className="absolute md:top-12 top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center md:gap-5 gap-1">
        {/* Main Title */}
        <div className="bg-slate-800 bg-opacity-100 md:px-14 px-6 rounded-full text-center">
          <h1 className="text-white lg:text-9xl md:text-8xl text-6xl font-bold font-jersey opacity-100 gradient-text-blue">
            ClimbTrak
          </h1>
        </div>

        {/* Subtitle */}
        <div className="bg-slate-800 bg-opacity-95 md:p-3 p-1 rounded-xl text-center md:max-w-7xl max-w-7xl">
          <h2 className="text-white lg:text-3xl md:text-xl text-xs font-bold font-barlow opacity-100">
            A community-driven platform for <TypewriterText />
          </h2>
        </div>

        {/* Buttons */}
        {user ? (
          <div className="bg-slate-800 md:text-2xl text-xs font-barlow text-white md:p-2 md:rounded-xl p-1 rounded-md md:mt-24 mt-5">
            Welcome Back, {user.name}
          </div>
        ) : null}
        <div
          className={clsx(
            'flex lg:flex-col flex-row items-center gap-4 ',
            user ? 'md:mt-0 mt-0' : 'md:mt-24 mt-5'
          )}
        >
          <div className="flex items-center justify-center gradient-background-blue rounded-lg shadow-2xl w-fit">
            <div className="bg-slate-800 md:m-2 md:p-2 m-1 p-1 rounded-lg flex items-center gap-2">
              <Link
                href="/routes"
                className="font-barlow text-white md:text-2xl text-xs text-center"
              >
                View Routes
              </Link>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                className="md:size-8 size-6 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-center bg-green-500 rounded-lg shadow-2xl w-fit">
            <div className="bg-slate-800 md:m-2 md:p-2 m-1 p-1 rounded-lg flex items-center gap-2">
              {!user ? (
                <Link
                  href="/signin"
                  className="font-barlow text-white md:text-2xl text-xs text-center"
                >
                  Sign in / Sign up
                </Link>
              ) : (
                <Link
                  href="/signin"
                  className="font-barlow text-white md:text-2xl text-xs text-center"
                >
                  Dashboard
                </Link>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                className="md:size-8 size-6 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
