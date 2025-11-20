import Image from "next/image";
export default function LogoSlide() {
  return (
    <div className="flex flex-col items-center justify-center md:p-5 p-2 rounded-md bg-blue-500/25 outline outline-blue-500 h-full w-full">
      <Image
        src="https://climbontherocks.com/cdn/shop/files/OTR_Logo-People_OG_Amherst_Ohio.png?v=1689615195&width=360"
        alt="Logo"
        width={500}
        height={500}
      />
    </div>
  );
}
