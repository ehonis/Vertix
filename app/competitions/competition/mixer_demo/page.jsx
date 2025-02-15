import Link from 'next/link';

export default function page() {
  return (
    <div className="flex flex-col justify-center items-center p-10 gap-5">
      <h1 className="text-white font-barlow text-3xl">Spring Mixer Demo</h1>
      <div className="flex flex-col justify-center items-center gap-32 bg-bg2 p-10 rounded-md">
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          stroke="currentColor"
          strokeWidth={1.25}
          className="size-32 stroke-white fill-none"
          style={{
            filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))',
          }}
        >
          <path d="M3,13A9,9 0 0,0 12,22A9,9 0 0,0 3,13M12,22A9,9 0 0,0 21,13A9,9 0 0,0 12,22M18,3V8A6,6 0 0,1 12,14A6,6 0 0,1 6,8V3C6.74,3 7.47,3.12 8.16,3.39C8.71,3.62 9.2,3.96 9.61,4.39L12,2L14.39,4.39C14.8,3.96 15.29,3.62 15.84,3.39C16.53,3.12 17.26,3 18,3Z" />
        </svg>

        <div className="flex flex-col gap-5">
          <p className="text-white font-barlow text-center text-xs">
            this uses previous year{"'"}s{' (2024)'} data. This is just a demo
            for you to see how comp day will work. No points, attempts, or
            completions will be counted
          </p>
          <Link
            href={'/events/competition/mixer_demo/scroller_demo'}
            className="px-2 py-1 text-white bg-green-500 rounded font-barlow text-center"
          >
            Start Demo
          </Link>
          <Link
            href={'/events/competition/mixer_demo/leaderboard'}
            className="px-2 py-1 text-white bg-yellow-500 rounded font-barlow text-center shadow-yellow-400 shadow-lg outline outline-2 outline-black"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
