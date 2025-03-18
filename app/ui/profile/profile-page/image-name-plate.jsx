import Image from 'next/image';

export default function ImageNamePlate({ image, name, username, title, id }) {
  if (username === null) {
    username = id;
  }
  return (
    <>
      <div className="flex flex-col items-start px-4 py-4 relative">
        {/* Profile Picture */}
        <div className="relative -mb-16 z-10">
          {image === null ? (
            <Image
              src={
                'https://8jiyvthxbb.ufs.sh/f/bujx12z5cHJjhC8qChmfsrL6AEIclW7bn0CeSKix1gBohFRZ'
              }
              width={120}
              height={120}
              className="rounded-full border-4 border-bg2"
              alt="picture of user"
            />
          ) : (
            <Image
              src={image}
              width={120}
              height={120}
              className="rounded-full border-4 border-bg2"
              alt="picture of user"
            />
          )}

          <div className="absolute bottom-0 right-0 bg-white text-black text-xs px-2 py-1 rounded-full drop-shadow-customBlack">
            {title}
          </div>
        </div>

        {/* Name and ID Plate */}
        <div className="bg-bg2 w-full max-w-md rounded-lg mt-12 p-6 px-5 relative">
          <h1 className="text-white font-barlow font-bold text-3xl text-start drop-shadow-customBlack">
            {name}
          </h1>
          <h2 className="text-gray-400 font-barlow font-bold text-start drop-shadow-customBlack">
            @{username}
          </h2>
        </div>
      </div>
    </>
  );
}
