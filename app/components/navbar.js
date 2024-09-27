import Link from "next/link";
import Image from "next/image";
//181A1B - darkgrey
export default function NavBar() {
  return (
    <nav className="flex bg-white shadow sticky top-0 z-50 h-16 justify-between items-center text-2xl p-5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>

      <Link key="logo" href={"/"}>
        <Image
          className="mt-1"
          src={"/img/OTR_Logo.avif"}
          width={110}
          height={110}
          alt="picture of otr logo"
        />
      </Link>
      <div className="space-x-4">
        <a href="#home" className="text-gray-800 hover:text-blue-600">
          Home
        </a>
        <a href="#about" className="text-gray-800 hover:text-blue-600">
          About
        </a>
        <a href="#contact" className="text-gray-800 hover:text-blue-600">
          Contact
        </a>
      </div>
    </nav>
  );
}
