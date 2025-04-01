import Link from "next/link";

export default function Announcement({}) {
  return (
    <Link
      href="/competitions/mixer/cm780exfs0002oi365hvzdtt2"
      className=" rounded-lg md:w-md mt-20"
    >
      <h2 className="font-barlow text-white text-sm font-semibold text-center ">
        ❗<span className="underline">Sign ups are now open for Spring Mixer 2025</span>❗
      </h2>
    </Link>
  );
}
