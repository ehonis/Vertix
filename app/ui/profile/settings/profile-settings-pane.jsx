import Image from 'next/image';

export default function ProfileSettingsPane({ userData }) {
  return (
    <div className="w-grow bg-bg1 flex-grow p-5 rounded-lg">
      <Image
        src={userData.image}
        height={1000}
        width={1000}
        className="rounded-full size-28"
      ></Image>
      <div className="w-full">Hello</div>
    </div>
  );
}
