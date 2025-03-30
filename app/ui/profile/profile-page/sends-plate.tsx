import { Badge } from "@prisma/client";

type SendsPlateBadge = {
  completions: number | undefined;
  highlightedBadge: Badge | undefined;
};
export default function SendsBadgePlate({ completions, highlightedBadge }: SendsPlateBadge) {
  return (
    <div className="flex gap-3 w-xs md:w-md">
      <div className="w-1/2 bg-slate-900 p-2 rounded-lg justify-center items-center flex flex-col gap-4">
        <p className=" font-barlow font-bold gradient-text-purple-pink text-8xl drop-shadow-customBlack">
          {completions}
        </p>
        <p className="font-barlow font-bold text-white text-xl">Total Sends</p>
      </div>
      <div className="w-1/2 p-2 bg-slate-900 rounded-lg justify-center items-center flex flex-col gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-24 stroke-white drop-shadow-customBlack"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
          />
        </svg>
        <p className="font-barlow font-bold text-white text-md text-center ">
          No Highlighted Badge
        </p>
      </div>
    </div>
  );
}
