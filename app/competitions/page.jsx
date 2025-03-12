import Link from 'next/link';
import TrophyIcon from '../ui/competitions/trophy-icon';
import Image from 'next/image';

export default function page() {
  return (
    <>
      <div className="relative flex justify-center items-center pt-20">
        {/* Circular Gradient Background */}
        <TrophyIcon />
      </div>

      {/* Events Header */}
      <h1 className="font-barlow font-bold text-white text-3xl flex justify-center mt-16 relative">
        Competitions
      </h1>

      {/* Event List */}
      <div className="m-2 rounded-sm flex justify-center ">
        <div className="flex flex-col gap-3 p-3 w-96">
          <Link
            href={'/competitions/competition/mixer_demo'}
            className="flex bg-bg2 rounded-lg h-24 p-2 gap-3 items-center outline outline-white "
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              stroke="currentColor"
              strokeWidth={1.25}
              className="size-16 stroke-white fill-none mr-5"
              style={{
                filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))',
              }}
            >
              <path d="M3,13A9,9 0 0,0 12,22A9,9 0 0,0 3,13M12,22A9,9 0 0,0 21,13A9,9 0 0,0 12,22M18,3V8A6,6 0 0,1 12,14A6,6 0 0,1 6,8V3C6.74,3 7.47,3.12 8.16,3.39C8.71,3.62 9.2,3.96 9.61,4.39L12,2L14.39,4.39C14.8,3.96 15.29,3.62 15.84,3.39C16.53,3.12 17.26,3 18,3Z" />
            </svg>
            <p className="font-barlow font-bold text-white text-xl text-center">
              Spring Mixer Demo
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}
