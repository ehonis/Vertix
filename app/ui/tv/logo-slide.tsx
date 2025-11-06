import Image from "next/image";

export default function LogoSlide() {
  return (
    <div className="flex items-center justify-center rounded-md  h-full w-full gap-16">
      <Image
        src="/img/upscalemedia-transformed.webp"
        alt="Logo"
        width={500}
        height={500}
        className="z-10 -ml-[3rem]"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-16 stroke-white stroke-2 mt-5 z-10"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>

      <div className="flex flex-col items-center justify-center z-10 -mt-10">
        <p className="text-white font-jost text-[10rem]">Vertix</p>
        <p className="text-white font-barlow text-xl -mr-32 -mt-16">
          All of your climbing data, in one place
        </p>
      </div>
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
