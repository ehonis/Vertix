import Link from "next/link";
export default function SignUpPrompt() {
  return (
    <div className="text-white font-barlow">
      <Link
        href={"/signin"}
        className="bg-green-400/15 outline-green-400 flex justify-between gap-3 px-2 outline-3  py-1 rounded-md items-center"
      >
        <p className="text-xl font-medium">Sign up to start tracking!</p>
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
      </Link>
    </div>
  );
}
