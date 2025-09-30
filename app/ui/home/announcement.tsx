import Link from "next/link";

export default function Announcement({}) {
  return (
    <Link
      href="/routes"
      className=" rounded-lg md:w-md w-[70%] font-barlow text-white text-md font-semibold text-center text-lg"
    >
      <span className="underline">XP & Boulder League signups are LIVE</span>
    </Link>
  );
}
