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
    <div className=" bg-bg1 md:w-[30rem] w-[22rem] p-5 rounded-lg flex-col flex gap-3">
      <div className="flex justify-between">
        <h2 className="text-white text-2xl font-bold ">
          Profile Settings <span className="text-red-500">WIP</span>
        </h2>
        {!userData.image ? (
          <Image
            src={userData.image}
            height={300}
            width={300}
            className="rounded-full size-28"
          ></Image>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="size-28 cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        )}
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
