'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ProfileSettingsPane({ userData }) {
  const [isSaveButton, setIsSaveButton] = useState(false);

  const handleTextFieldChange = () => {
    if (!isSaveButton) {
      setIsSaveButton(true);
    }
  };
  return (
    <div className=" bg-bg1 w-[30rem] p-5 rounded-lg flex-col flex gap-3">
      <div className="flex justify-between">
        <h2 className="text-white text-2xl font-bold ">Profile Settings</h2>
        <Image
          src={userData.image}
          height={300}
          width={300}
          className="rounded-full size-28"
        ></Image>
      </div>
      <div className="flex gap-4">
        <label htmlFor="" className="text-white text-xl ">
          Name:
        </label>
        <input
          type="text"
          defaultValue={userData.name}
          className="p-1 rounded"
          onChange={handleTextFieldChange}
        />
      </div>
      <div className="flex gap-4">
        <label htmlFor="" className="text-white text-xl">
          Username:
        </label>
        <div className="flex">
          <p className="bg-bg2 text-white rounded-l p-1 text-center">@</p>
          <input
            type="text"
            defaultValue={userData.id}
            className="p-1 rounded-r"
            onChange={handleTextFieldChange}
          />
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <label htmlFor="" className="text-white text-xl ">
          Email:
        </label>
        <p className="text-white">{userData.email}</p>
      </div>
      {isSaveButton ? (
        <button className="bg-green-500 text-white w-32 p-1 rounded">
          Save Changes?
        </button>
      ) : null}
    </div>
  );
}
