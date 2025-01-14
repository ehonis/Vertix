import TrophyIcon from '../ui/events/trophy-icon';
import Image from 'next/image';

export default function page() {
  return (
    <>
      <div className="relative flex justify-center items-center pt-20">
        {/* Circular Gradient Background */}
        <TrophyIcon />
      </div>

      {/* Blue Fade Background */}
      <div className="-z-10 fixed bottom-0 left-0 w-full h-[66%] bg-gradient-to-t from-blue-500 to-transparent"></div>

      {/* Events Header */}
      <h1 className="font-barlow text-white text-3xl flex justify-center mt-16 relative">
        Events
      </h1>

      {/* Event List */}
      <div className="m-2 rounded relative">
        <div className="absolute inset-0 bg-bg1 rounded opacity-65 h-full z-[-1]"></div>
        <div className="flex flex-col gap-3 p-3 relative ">
          <div className="flex bg-gray-300 rounded-lg h-24 p-2 gap-3 items-center">
            <Image
              src={'/img/circlebadge.png'}
              width={80}
              height={100}
              alt="Picture of the author"
              className=""
            />
            <p className="font-barlow text-black text-xl">
              2024 Winter High Ball
            </p>
          </div>
          <div className="flex bg-gray-300 rounded-lg h-24 p-2 gap-3 items-center">
            <Image
              src={'/img/circlebadge.png'}
              width={80}
              height={100}
              alt="Picture of the author"
              className=""
            />
            <p className="font-barlow text-black text-xl">
              2024 Winter High Ball
            </p>
          </div>
          <div className="flex bg-gray-300 rounded-lg h-24 p-2 gap-3 items-center">
            <Image
              src={'/img/circlebadge.png'}
              width={80}
              height={100}
              alt="Picture of the author"
              className=""
            />
            <p className="font-barlow text-black text-xl">
              2024 Winter High Ball
            </p>
          </div>
          <div className="flex bg-gray-300 rounded-lg h-24 p-2 gap-3 items-center">
            <Image
              src={'/img/circlebadge.png'}
              width={80}
              height={100}
              alt="Picture of the author"
              className=""
            />
            <p className="font-barlow text-black text-xl">
              2024 Winter High Ball
            </p>
          </div>
          <div className="flex bg-gray-300 rounded-lg h-24 p-2 gap-3 items-center">
            <Image
              src={'/img/circlebadge.png'}
              width={80}
              height={100}
              alt="Picture of the author"
              className=""
            />
            <p className="font-barlow text-black text-xl">
              2024 Winter High Ball
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
