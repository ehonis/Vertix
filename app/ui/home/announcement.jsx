import Link from "next/link";

export default function Announcement({}) {
  return (
    <Link
      href="/competitions/competition/mixer/cm780exfs0002oi365hvzdtt2"
      className="flex justify-between items-center blue-button rounded-lg p-2 px-4 w-4/5 md:w-md mt-3 "
    >
      <h2 className="font-barlow text-white text-lg font-semibold text-center ">
        Sign ups are now open for Spring Mixer 2025!
      </h2>
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </div>
    </Link>
  );
}
