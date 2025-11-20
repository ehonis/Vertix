import Image from "next/image";
import VertixLogo from "./vertix-logo";

export default function LogoSlide() {
  return (
    <div className="flex items-center justify-center rounded-md h-full w-full gap-28 ml-28">
      <div className="z-10">
        <Image
          src="/img/upscalemedia-transformed.webp"
          alt="Logo"
          width={1000}
          height={1000}
          className="w-full h-full object-contain scale-125"
        />
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="stroke-white stroke-2 z-10 size-24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>

      <VertixLogo />
      <div
        className="absolute inset-0 opacity-100 "
        style={{
          background: "radial-gradient(circle at top left, #6b21a8 0%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: "radial-gradient(circle at bottom right, #1447E6 0%, transparent 75%)",
        }}
      />
    </div>
  );
}
