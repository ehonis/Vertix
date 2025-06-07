import Link from "next/link";

export default function Announcement({}) {
  return (
    <Link
      href="/routes"
      className=" rounded-lg md:w-md font-barlow text-white text-md font-semibold text-center  "
    >
      ❗<span className="underline">Route Tracking is LIVE</span>❗
    </Link>
  );
}
