import Image from "next/image";
import { User } from "@prisma/client";

type ImageNamePlate = {
  user: User;
};

export default function ImageNamePlate({ user }: ImageNamePlate) {
  if (user.username === null) {
    user.username = user.id;
  }

  return (
    <>
      <div className="flex flex-col items-start px-4 py-4 relative">
        {/* Profile Picture */}
        <div className="relative -mb-16 z-10 ">
          {user.image === null ? (
            <Image
              src={"https://8jiyvthxbb.ufs.sh/f/bujx12z5cHJjhC8qChmfsrL6AEIclW7bn0CeSKix1gBohFRZ"}
              width={500}
              height={500}
              className="rounded-full border-4 border-slate-900 size-36 object-cover"
              alt="picture of user"
            />
          ) : (
            <Image
              src={user.image}
              width={120}
              height={120}
              className="rounded-full border-4 border-slate-900 size-36 object-cover"
              alt="picture of user"
            />
          )}

          <div className="absolute bottom-0 -right-5 bg-white text-black text-xs px-2 py-1 rounded-full drop-shadow-customBlack">
            {user.tag}
          </div>
        </div>

        {/* Name and ID Plate */}
        <div className="bg-slate-900  w-xs md:w-md rounded-lg mt-12 p-6 px-4 relative flex justify-between items-center">
          <div>
            <h1 className="text-white font-barlow font-bold text-2xl text-start drop-shadow-customBlack">
              {user.name}
            </h1>
            <h2 className="text-gray-400 font-barlow font-bold text-start text-sm drop-shadow-customBlack">
              @{user.username}
            </h2>
          </div>
          <div className="font-barlow text-white flex flex-col justify-center items-center gap-1">
            <p className="font-bold text-lg">Highest Grade</p>
            <div className="flex gap-3">
              <p>{user.highestRopeGrade ? user.highestRopeGrade : "n/a"}</p>
              <div className="bg-white rounded-full h-8 w-0.5"></div>
              <p>{user.highestBoulderGrade ? user.highestBoulderGrade : "n/a"}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
