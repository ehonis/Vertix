import Link from 'next/link';

export default function DemoPage() {
  return (
    <div>
      {/* back arrow */}
      <div className="m-5 absolute ">
        <Link href={'/events'}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
        </Link>
      </div>
      <div className="flex flex-col justify-between py-16 px-5 items-center h-screen-offset">
        <div className="bg-gray-300 rounded-full p-8 flex justify-center items-center shadow-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-32 stroke-white"
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
        </div>
        <Link
          className="bg-green-500 text-white p-3 rounded-md font-barlow text-3xl"
          href={'/events/competition/demo/score-keeper'}
        >
          Start Demo
        </Link>
        <p className="font-barlow text-xl text-white text-center">
          This is a demo of starting a competition. Depending on the
          competition, the layout, scores, and time might be different. No
          scores will be recorded during the demo.
        </p>
      </div>
    </div>
  );
}
