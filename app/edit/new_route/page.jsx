'use client';
import { useState } from 'react';
import GradeSelect from '@/app/ui/edit/new_route/grade-select';
import ConfirmationPopUp from '@/app/ui/edit/new_route/confirmation-pop-up';
import { findType } from '@/lib/routeScripts';
import Notification from '@/app/ui/notification';
import TopDown from '@/app/ui/routes/topdown';
import Link from 'next/link';
import clsx from 'clsx';

export default function Page() {
  const [isNotification, setNotification] = useState(false);
  const [emotion, setEmotion] = useState();
  const [message, setMessage] = useState();
  const [isPopUp, setIsPopUp] = useState(false);
  const [routeName, setRouteName] = useState();
  const [grade, setGrade] = useState();
  const [color, setColor] = useState();
  const [wallSection, setWallSection] = useState(null);
  const [date, setDate] = useState('');

  const handleRouteNameChange = (event) => setRouteName(event.target.value);
  const handleGradeChange = (selectedGrade) => setGrade(selectedGrade);

  const handleSubmit = () => {
    if (!routeName) {
      setEmotion('bad');
      setMessage('Please make sure you have a title before you submit');
      setNotification(true);
    } else if (!grade) {
      setEmotion('bad');
      setMessage('Please make sure you have a grade before you submit');
      setNotification(true);
    } else if (!color) {
      setEmotion('bad');
      setMessage('Please make sure you have a color before you submit');
      setNotification(true);
    } else if (!wallSection) {
      setEmotion('bad');
      setMessage('Please make sure you have a section before you submit');
      setNotification(true);
    } else if (date === '') {
      setEmotion('bad');
      setMessage('Please make sure you have a date before you submit');
      setNotification(true);
    } else {
      setIsPopUp(true);
    }
  };

  const handleConfirmation = async () => {
    setIsPopUp(false);
    const type = findType(grade);
    try {
      await fetch('/api/add-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routeName,
          grade,
          type,
          color,
          date,
          wallSection,
        }),
      });
      setEmotion('happy');
      setMessage('Successfully Added a New Route');
      setNotification(true);
    } catch (error) {
      setEmotion('bad');
      setMessage(error);
      setNotification(true);
    }
  };

  const handleCancel = () => {
    setIsPopUp(false);
  };

  const handleQuit = () => {
    setNotification(false);
  };

  const handleColorChange = (event) => {
    setColor(event.target.value);
  };

  const handleData = (data) => {
    setWallSection(data);
  };

  const setDateClickNow = () => {
    setDate(new Date().toLocaleDateString('en-US')); // Sets the date to the current date in MM/DD/YYYY format
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  return (
    <>
      <div className="flex items-center justify-between text-center py-10 md:px-24 px-11 w-full">
        <Link href={'/edit'}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="White"
            className="size-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
        </Link>
        <h1 className="text-white font-bold text-3xl">New Route</h1>
        <div></div>
      </div>

      {isNotification && (
        <Notification emotion={emotion} message={message} onQuit={handleQuit} />
      )}
      {isPopUp && (
        <ConfirmationPopUp
          message="Are you sure you want to perform this action?"
          submessage="This will enter a new route for everyone to see"
          onConfirmation={handleConfirmation}
          onCancel={handleCancel}
        />
      )}
      <div className="bg-[#181a1c] md:mx-24 mx-2 flex items-center justify-center md:py-10 py-2 rounded-3xl md:px-0 px-2">
        <div className="flex md:w-3/4 w-full flex-col justify-center overflow-hidden rounded-3xl py-5 md:px-56 px-5 bg-[#3d4349] shadow-md">
          <div className="flex flex-col items-center gap-3">
            <input
              type="text"
              placeholder="Route Name"
              className="w-full rounded-lg bg-[#202224] p-2 text-white"
              value={routeName}
              onChange={handleRouteNameChange}
            />
            <div className="flex justify-start w-full">
              <GradeSelect onGradeChange={handleGradeChange} />
            </div>
            <div className="flex justify-start w-full gap-3">
              <p className="text-lg font-bold text-[#181a1c] w-14">Color:</p>
              <select
                className="bg-[#181a1c] rounded text-gray-400 p-1"
                onChange={handleColorChange}
              >
                <option value=""></option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="red">Red</option>
                <option value="orange">Orange</option>
                <option value="yellow">Yellow</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
                <option value="brown">Brown</option>
              </select>
            </div>
            <div className="flex justify-start w-full gap-3 items-center">
              <p className="text-lg font-bold text-[#181a1c] w-18">Set Date:</p>
              <button
                className={clsx('bg-bg1 px-2 py-1 text-white rounded-md', {
                  'bg-blue-500':
                    date === new Date().toLocaleDateString('en-US'),
                })}
                onClick={setDateClickNow}
              >
                Now
              </button>
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={date}
                onChange={handleDateChange}
                className="w-32 bg-[#202224] px-2 py-1 text-white rounded-lg"
              />
            </div>
            <p className="text-bg1 font-bold text-md italic">
              Route Section <span className="text-red-500">*</span>
            </p>
            <div className="bg-bg1 p-3 rounded-xl">
              <TopDown onData={handleData} />
            </div>
            <p className="text-bg1 font-bold text-md">
              Current Selection:{' '}
              <span className="text-blue-500">{wallSection}</span>
            </p>
            <div className="flex justify-end w-3/4">
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-blue-500 p-2 text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
