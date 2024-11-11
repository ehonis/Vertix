'use client';

import { useState } from 'react';
import ProfileSettingsPane from './profile-settings-pane';

export default function SettingsNavBar({ userData }) {
  const [isPrivacy, setIsPrivacy] = useState(false);
  const [isProfile, setIsProfile] = useState(false);

  const handleProfileClick = () => {
    setIsProfile(!isProfile);
  };
  const handlePrivacyClick = () => {
    setIsPrivacy(!isPrivacy);
  };

  return (
    <div className="flex md:flex-row flex-col gap-5 w-full ">
      <nav className="bg-bg1 w-48 h-max rounded-lg p-5 flex flex-col gap-3">
        <button
          className="flex items-center justify-between bg-bg2 rounded p-1 group hover:bg-white transition-all duration-300"
          onClick={handleProfileClick}
        >
          <p className="text-white group-hover:text-black">Profile Settings</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            className="size-4 stroke-white group-hover:stroke-black"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
        <button
          className="flex items-center justify-between bg-bg2 rounded p-1 group hover:bg-white transition-all duration-300"
          onClick={handlePrivacyClick}
        >
          <p className="text-white group-hover:text-black">Privacy Settings</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            className="size-4 stroke-white group-hover:stroke-black"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </nav>
      {isProfile ? <ProfileSettingsPane userData={userData} /> : null}
    </div>
  );
}
