'use client';

import { useState } from 'react';
import clsx from 'clsx';
export default function SearchTextBox({ onDataFetch }) {
  const [searchText, setSearchText] = useState('');
  const [routesBool, setRoutesBool] = useState(true);
  const [profilesBool, setProfilesBool] = useState(false);
  const handleRoutesButtonChange = () => {
    setRoutesBool(true);
    setProfilesBool(false);
  };
  const handleProfilesButtonChange = () => {
    setRoutesBool(false);
    setProfilesBool(true);
  };
  const handleTextChange = (event) => {
    const tempSearchText = event.target.value;

    setSearchText(tempSearchText);
  };
  const handleSubmit = async () => {
    if (searchText === '') {
      return;
    } else {
      const queryData = new URLSearchParams({
        routes: routesBool,
        profiles: profilesBool,
        text: searchText,
      });
      try {
        const response = await fetch(`/api/search?${queryData.toString()}`);
        if (!response.ok) {
          console.log('error');
        }
        const result = await response.json();
        onDataFetch(result);
      } catch (error) {
        console.error(error);
      }
    }
  };
  return (
    <>
      <div className="flex mx-5 mt-5 justify-center items-center pr-3">
        <div className="flex gap-3">
          <button
            className={clsx(
              'bg-bg2 outline outline-1 outline-gray-400 px-2 py-1 rounded-full ',
              routesBool ? 'bg-green-400 outline-none' : null
            )}
            onClick={handleRoutesButtonChange}
          >
            <p className="text-white font-barlow drop-shadow-customBlack">
              Routes
            </p>
          </button>
          <button
            className={clsx(
              'bg-bg2 outline outline-1 outline-gray-400 px-2 py-1 rounded-full text-white font-barlow drop-shadow-customBlack',
              profilesBool ? 'bg-green-400 outline-none' : null
            )}
            onClick={handleProfilesButtonChange}
          >
            <p className="text-white font-barlow drop-shadow-customBlack">
              Profiles
            </p>
          </button>
        </div>
      </div>
      <div className="flex justify-center mt-3">
        <div className="bg-bg2 outline outline-1 outline-gray-400 rounded-l-full w-9/12 md:w-1/2 h-12 flex items-center justify-between px-5 text-white font-barlow drop-shadow-customBlack">
          <input
            type="text"
            className="bg-transparent w-full font-barlow text-white"
            placeholder="Search..."
            value={searchText}
            onChange={handleTextChange}
          />
        </div>
        <button
          className="bg-bg1 flex justify-center items-center rounded-r-full pl-3 pr-4 outline outline-1 outline-gray-400 drop-shadow-customBlack"
          onClick={handleSubmit}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
