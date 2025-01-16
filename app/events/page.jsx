import Link from 'next/link';
import TrophyIcon from '../ui/events/trophy-icon';
import Image from 'next/image';

export default function page() {
  return (
    <>
      <div className="relative flex justify-center items-center pt-20">
        {/* Circular Gradient Background */}
        <TrophyIcon />
      </div>

      {/* Blue Fade Background */}
      <div className="-z-10 fixed bottom-0 left-0 w-full h-[66%] bg-gradient-to-t from-blue-500 to-transparent"></div>

      {/* Events Header */}
      <h1 className="font-barlow text-white text-3xl flex justify-center mt-16 relative">
        Events
      </h1>

      {/* Event List */}
      <div className="m-2 rounded relative">
        <div className="absolute inset-0 bg-bg1 rounded opacity-65 h-full z-[-1]"></div>
        <div className="flex flex-col gap-3 p-3 relative ">
          <Link
            className="flex bg-gray-300 rounded-lg h-24 p-3 gap-10 items-center"
            href={'/events/competition/demo'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-16 stroke-white"
              style={{
                filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))',
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>

            <p className="font-barlow text-black text-xl">Demo Competition</p>
          </Link>
          <div className="flex bg-gray-300 rounded-lg h-24 p-2 gap-3 items-center">
            <Image
              src={'/img/circlebadge.png'}
              width={80}
              height={100}
              alt="Picture of the author"
              className=""
            />
            <p className="font-barlow text-black text-xl">
              2024 Winter High Ball
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
