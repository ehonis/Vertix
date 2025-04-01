import Link from "next/link";

export default function Announcement({}) {
  return (
    <Link
      href="/competitions/mixer/cm780exfs0002oi365hvzdtt2"
      className=" outline-3 rounded-lg gap-2 md:w-md  "
    >
      <h2 className="font-barlow text-white text-sm font-semibold text-center ">
        ❗<span className="underline">Sign ups are now open for Spring Mixer 2025</span> ❗
      </h2>
    </Link>
  );
}
