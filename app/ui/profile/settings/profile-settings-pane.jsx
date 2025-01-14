'use client';
import { useState } from 'react';
import { useNotification } from '@/app/contexts/NotificationContext';
import Image from 'next/image';

export default function ProfileSettingsPane({ userData }) {
  const showNotification = useNotification();
  const [isSaveButton, setIsSaveButton] = useState(false);
  const [id, setId] = useState(userData.id);
  const [name, SetName] = useState(userData.name);

  const handleIdChange = (event) => {
    const newId = event.target.value;
    setId(newId);

    if (!isSaveButton) {
      setIsSaveButton(true);
    }
  };
  const handleNameChange = (event) => {
    const newName = event.target.value;
    SetName(newName);

    if (!isSaveButton) {
      setIsSaveButton(true);
    }
  };

  const handleSubmit = async () => {
    const data = { name: name, id: id };
    try {
      const response = await fetch('/api/edit/updateRoute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        console.error(response.message);
      } else {
        showNotification({
          message: `Successfully Updated ${route.title}`,
          color: 'green',
        });
        router.refresh();
      }
    } catch (error) {
      showNotification({
        message: `${error}`,
        color: 'red',
      });
    }
  };

  return (
    <div className=" bg-bg1 md:w-[30rem] w-[22rem] p-5 rounded-lg flex-col flex gap-3">
      <div className="flex justify-between">
        <h2 className="text-white text-2xl font-barlow ">
          Profile Settings <span className="text-red-500 ">WIP</span>
        </h2>
        {userData.image ? (
          <Image
            src={userData.image}
            height={300}
            width={300}
            className="rounded-full size-28"
            alt="profile picture"
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
        <label htmlFor="" className="text-white text-xl font-barlow">
          Name:
        </label>
        <input
          type="text"
          value={name}
          className="p-1 rounded font-barlow"
          onChange={handleNameChange}
        />
      </div>
      <div className="flex gap-4">
        <label htmlFor="" className="text-white text-xl font-barlow">
          Username:
        </label>
        <div className="flex">
          <p className="bg-bg2 text-white rounded-l p-1 text-center font-barlow">
            @
          </p>
          <input
            type="text"
            value={id}
            className="p-1 rounded-r font-barlow"
            onChange={handleIdChange}
          />
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <label htmlFor="" className="text-white text-xl font-barlow">
          Email:
        </label>
        <p className="text-white font-barlow underline">{userData.email}</p>
      </div>
      {isSaveButton ? (
        <div className="flex w-full justify-end">
          <button className="bg-green-500 text-white w-32 p-1 rounded font-barlow">
            Save Changes?
          </button>
        </div>
      ) : null}
    </div>
  );
}
