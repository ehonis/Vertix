'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ElementLoadingAnimation from '../../general/element-loading-animation';
import { useNotification } from '@/app/contexts/NotificationContext';
import ImageUploaderPopUp from './image-uploader-popup';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
export default function Onboarding({ userData }) {
  const { showNotification } = useNotification();
  const router = useRouter();

  const [name, setName] = useState(userData.name);
  const [username, setUsername] = useState('');
  const [image, setImage] = useState(userData.image);
  const [tag, setTag] = useState('boulder');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploader, setIsImageUploader] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);

  // A debounce function that returns a cancel function for cleanup.
  const debounce = (func, delay) => {
    let timeoutId;
    const debouncedFunction = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
    debouncedFunction.cancel = () => clearTimeout(timeoutId);
    return debouncedFunction;
  };

  const checkUsername = useCallback(async () => {
    if (username.length > 0) {
      try {
        const response = await fetch(
          `/api/user/settings/userNameCheck?username=${encodeURIComponent(
            username
          )}`
        );
        const data = await response.json();
        setIsUsernameAvailable(data.available);
      } catch (error) {
        console.error('Error checking username:', error);
      }
    }
  }, [username]);

  const debouncedCheckUsername = useCallback(debounce(checkUsername, 2000), [
    checkUsername,
  ]);

  // Effect to check username as user types with cleanup.
  useEffect(() => {
    debouncedCheckUsername();

    return () => {
      debouncedCheckUsername.cancel();
    };
  }, [username, debouncedCheckUsername]);

  const handleSave = async () => {
    setIsLoading(true);
    if (name.trim() === '' || username.trim() === '') {
      showNotification({ message: 'Please fill in all fields', color: 'red' });
      setIsLoading(false);
      return;
    }

    if (!isUsernameAvailable) {
      showNotification({
        message: 'Username is already taken',
        color: 'red',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/settings/uploadOnboarding', {
        method: 'POST',
        body: JSON.stringify({ id: userData.id, name, username, tag }),
      });

      if (response.ok) {
        showNotification({
          message: 'Successfully updated profile',
          color: 'green',
        });
      } else {
        showNotification({
          message: 'Failed to update profile',
          color: 'red',
        });
      }
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      showNotification({
        message: 'An unexpected error occurred.',
        color: 'red',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col bg-black p-3 h-full w-full rounded-md rounded-tl-none font-barlow">
      {isImageUploader && (
        <ImageUploaderPopUp
          onCancel={() => setIsImageUploader(false)}
          imageUrl={image}
          userId={userData.id}
        />
      )}
      <h2 className="text-white text-2xl font-bold text-center ">
        Let{"'"}s get to know you better
      </h2>
      <p className="text-white text-xs italic text-center">
        You are not required to fill this information, but it helps indentify
        you in the community
      </p>
      <div className="flex flex-col gap-3 mt-5 px-5">
        <div className="flex flex-col gap-1">
          <button
            className="flex flex-col items-center justify-center"
            onClick={() => setIsImageUploader(true)}
          >
            {image === null ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-16 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            ) : (
              <Image
                src={image}
                alt="profile"
                width={100}
                height={100}
                className="size-16 rounded-full"
              />
            )}
            <p className="text-white text-xs text-center">
              Tap here to upload a image
            </p>
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-white font-bold text-lg text-start">
            What is your name?
          </p>
          <input
            type="text"
            className="text-white text-md bg-bg2 rounded  p-2"
            value={name}
            placeholder={'First and Last Name'}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-white text-xs text-start">
            This will be used to identify you in the community
          </p>
        </div>
        <div className="flex flex-col gap-1 ">
          <p className="text-white font-bold text-lg text-start">username?</p>
          <div
            className={clsx(
              'flex items-center rounded-md',
              !isUsernameAvailable &&
                username.length > 0 &&
                'outline-2 outline-red-500',
              isUsernameAvailable &&
                username.length > 0 &&
                'outline-2 outline-green-500'
            )}
          >
            <p className="text-white text-lg p-2 bg-blue-500 rounded-l font-bold">
              @
            </p>
            <input
              type="text"
              className="text-white text-lg bg-bg2 rounded-r p-2 w-full focus:outline-none"
              placeholder={userData.id}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          {username.length > 0 && (
            <>
              {!isUsernameAvailable ? (
                <p className="text-red-500 text-xs text-center">
                  This username is already taken
                </p>
              ) : (
                <p className="text-green-500 text-xs text-center">
                  This username is available!
                </p>
              )}
              <p className="text-white text-xs text-center">
                This has to be unique
              </p>
            </>
          )}
        </div>
        <div className="flex flex-col gap-1 items-center">
          <p className="text-white font-bold text-lg text-center">
            What do you mainly climb?
          </p>
          <div className="flex items-center">
            <select
              className="text-white text-lg bg-bg2 rounded p-2"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              <option value="boulder">Boulders</option>
              <option value="lead">Ropes</option>
              <option value="toprope">All Round</option>
              <option value="none">Prefer not to say</option>
            </select>
          </div>
        </div>
        <button
          className="bg-blue-500 text-white font-bold text-lg p-2 rounded-md mt-2"
          onClick={handleSave}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <ElementLoadingAnimation />
            </div>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  );
}
