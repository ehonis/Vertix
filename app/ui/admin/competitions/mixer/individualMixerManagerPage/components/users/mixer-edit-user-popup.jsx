'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import Image from 'next/image';
import FindUserPopUp from './mixer-find-user-popup';
import { useNotification } from '@/app/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import ConfirmationPopUp from '@/app/ui/admin/new_route/confirmation-pop-up';

export default function EditUserPopUp({
  compId,
  type,
  onCancel,
  climber,
  boulderScore,
  ropeScore,
  divisions,
}) {
  const { showNotification } = useNotification();
  const router = useRouter();
  //user data
  const [climberName, setClimberName] = useState(climber?.name || '');
  const [entryMethod, setEntryMethod] = useState(
    climber?.entryMethod || 'MANUAL'
  );
  const [divisionId, setDivisionId] = useState(climber?.divisionId || 'none');
  const [connectedUser, setConnectedUser] = useState(null);

  //user route data
  const [tempBoulderScore, setTempBoulderScore] = useState(
    boulderScore?.score || ''
  );
  const [tempRopeScore, setTempRopeScore] = useState(ropeScore?.score || '');
  const [tempBoulderAttempts, setTempBoulderAttempts] = useState(
    boulderScore?.attempts || ''
  );
  const [tempRopeAttempts, setTempRopeAttempts] = useState(
    ropeScore?.attempts || ''
  );

  const [isSaveButton, setIsSaveButton] = useState(false);
  const [isUserSearchPopUp, setIsUserSearchPopUp] = useState(false);
  const [isConfirmationPopUp, setIsConfirmationPopUp] = useState(false);

  // Fetch connected user if entry method is APP
  useEffect(() => {
    const getConnectUser = async () => {
      const queryData = new URLSearchParams({
        userId: climber.userId,
      });
      try {
        const response = await fetch(
          `/api/mixer/manager/user/getMixerUser?${queryData.toString()}`
        );
        if (!response.ok) {
          console.log('error');
        }
        const result = await response.json();
        return result.user;
      } catch (error) {
        console.error(error);
      }
    };

    const setConnectedUserAsync = async () => {
      if (entryMethod === 'APP') {
        const user = await getConnectUser(); // Await the result
        setConnectedUser(user);
        console.log(user);
      }
    };
    if (climber) {
      setConnectedUserAsync();
    }
  }, [climber?.userId, entryMethod]);

  // Check for changes in any field
  useEffect(() => {
    // Check if any field has changed from its original value
    if (climber) {
      const hasChanges =
        climberName !== climber.name ||
        entryMethod !== climber.entryMethod ||
        tempBoulderScore !== boulderScore.score ||
        tempBoulderAttempts !== boulderScore.attempts ||
        tempRopeScore !== ropeScore.score ||
        tempRopeAttempts !== ropeScore.attempts ||
        divisionId !== climber.divisionId;

      setIsSaveButton(hasChanges);
    }
  }, [
    climberName,
    entryMethod,
    tempBoulderScore,
    tempBoulderAttempts,
    tempRopeScore,
    tempRopeAttempts,
    divisionId,
  ]);

  // Handle form changes
  const handleNameChange = (e) => {
    setClimberName(e.target.value);
  };

  const handleEntryMethodChange = (e) => {
    setEntryMethod(e.target.value);
    if (e.target.value === 'MANUAL') {
      setConnectedUser(null);
    }
  };

  const handleBoulderScoreChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numbers
    setTempBoulderScore(value);
  };

  const handleBoulderAttemptsChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numbers
    setTempBoulderAttempts(value);
  };

  const handleRopeScoreChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numbers
    setTempRopeScore(value);
  };

  const handleRopeAttemptsChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numbers
    setTempRopeAttempts(value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (climberName === '') {
      showNotification({ message: 'Cannot Submit: No Name', color: 'red' });
    } else if (tempBoulderScore === '') {
      showNotification({
        message: 'Cannot Submit: No Boulder Score',
        color: 'red',
      });
    } else if (tempBoulderAttempts === '') {
      showNotification({
        message: 'Cannot Submit: No boulder attempts',
        color: 'red',
      });
    } else if (tempRopeScore === '') {
      showNotification({
        message: 'Cannot Submit: No rope score',
        color: 'red',
      });
    } else if (tempRopeAttempts === '') {
      showNotification({
        message: 'Cannot Submit: No rope attempts',
        color: 'red',
      });
    } else if (entryMethod === 'APP' && !connectedUser) {
      showNotification({
        message: 'Cannot Submit: No selected user',
        color: 'red',
      });
    } else if (divisionId === 'none') {
      showNotification({
        message: 'Cannot Submit: No selected division',
        color: 'red',
      });
    } else {
      const data = {
        compId,
        userId: climber.id,
        name: climberName,
        ropeScore: tempRopeScore,
        boulderScore: tempBoulderScore,
        boulderAttempts: tempBoulderAttempts,
        ropeAttempts: tempRopeAttempts,
        user: connectedUser,
        divisionId,
        entryMethod,
      };
      try {
        const response = await fetch('/api/mixer/manager/user/updateUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const responseData = await response.json();
        if (!response.ok) {
          showNotification({ message: responseData.error, color: 'red' });
        } else {
          showNotification({ message: 'Updated User!', color: 'green' });
          router.refresh();
          onCancel();
        }
      } catch (error) {
        showNotification({ message: error, color: 'red' });
      }
    }
  };

  const handleUpdateConnectedUser = (user) => {
    setConnectedUser(user);
  };

  const handleDelete = async () => {
    setIsConfirmationPopUp(false);
    const data = { climberId: climber.id };
    try {
      const response = await fetch('/api/mixer/manager/user/deleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({ message: 'Could not delete user', color: 'red' });
      } else {
        showNotification({ message: 'Deleted User', color: 'green' });
        router.refresh();
        onCancel();
      }
    } catch (error) {
      showNotification({ message: 'Could not delete user', color: 'red' });
    }
  };

  const handleNewUserSubmit = async () => {
    if (climberName === '') {
      showNotification({ message: 'Cannot Submit: No Name', color: 'red' });
    } else if (tempBoulderScore === '') {
      showNotification({
        message: 'Cannot Submit: No Boulder Score',
        color: 'red',
      });
    } else if (tempBoulderAttempts === '') {
      showNotification({
        message: 'Cannot Submit: No boulder attempts',
        color: 'red',
      });
    } else if (tempRopeScore === '') {
      showNotification({
        message: 'Cannot Submit: No rope score',
        color: 'red',
      });
    } else if (tempRopeAttempts === '') {
      showNotification({
        message: 'Cannot Submit: No rope attempts',
        color: 'red',
      });
    } else if (entryMethod === 'APP' && !connectedUser) {
      showNotification({
        message: 'Cannot Submit: No selected user',
        color: 'red',
      });
    } else if (divisionId === 'none') {
      showNotification({
        message: 'Cannot Submit: No selected division',
        color: 'red',
      });
    } else {
      const data = {
        compId,
        name: climberName,
        ropeScore: tempRopeScore,
        boulderScore: tempBoulderScore,
        boulderAttempts: tempBoulderAttempts,
        ropeAttempts: tempRopeAttempts,
        user: connectedUser,
        divisionId,
        entryMethod,
      };
      try {
        const response = await fetch('/api/mixer/manager/user/addNewUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const responseData = await response.json();
        if (!response.ok) {
          showNotification({ message: responseData.error, color: 'red' });
        } else {
          showNotification({ message: 'Created New User!', color: 'green' });
          router.refresh();
          onCancel();
        }
      } catch (error) {
        showNotification({ message: error, color: 'red' });
      }
    }
  };

  return (
    <div>
      {isConfirmationPopUp && (
        <ConfirmationPopUp
          onConfirmation={handleDelete}
          onCancel={() => setIsConfirmationPopUp(false)}
          message={'Caution! This will delete the climber for the comp'}
          submessage={'this action cannot be undone'}
        />
      )}
      {isUserSearchPopUp && (
        <FindUserPopUp
          onCancel={() => setIsUserSearchPopUp(false)}
          onConnectUser={handleUpdateConnectedUser}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-bg2 p-3 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-2"
        >
          <button className="absolute top-2 right-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h2 className="text-xl">
            {type === 'NEW' && 'New '}Climber {type === 'EDIT' && 'Editor'}
          </h2>
          {/* name and entryMethod */}
          <div className="flex justify-center">
            <input
              type="text"
              value={climberName}
              name=""
              id=""
              onChange={handleNameChange}
              className="text-white rounded-l bg-bg0 px-2 py-1 w-48 focus:outline-hidden"
              placeholder="Climber Name"
            />
            <select
              name=""
              id=""
              value={entryMethod}
              onChange={handleEntryMethodChange}
              className={clsx(
                'font-light bg-bg1 p-1 rounded-r text-center w-24',
                entryMethod === 'MANUAL' ? 'text-gray-300' : 'text-green-400'
              )}
            >
              <option value="APP">APP</option>
              <option value="MANUAL">MANUAL</option>
            </select>
          </div>
          {/* connected user */}
          {connectedUser === null && entryMethod === 'APP' ? (
            <div className="flex justify-center">
              <button
                className="px-2 py-1 bg-blue-500 rounded-sm w-72 "
                onClick={() => setIsUserSearchPopUp(true)}
              >
                Connect to a User
              </button>
            </div>
          ) : null}
          {connectedUser !== null && entryMethod === 'APP' ? (
            <div className="flex justify-center">
              <div className="flex bg-bg1 items-center p-2 rounded-sm w-72 justify-between">
                {/* user image */}
                <div className="flex justify-between w-full gap-2">
                  <div className="flex gap-2">
                    {connectedUser.image !== null ? (
                      <Image
                        src={connectedUser.image}
                        width={48}
                        height={48}
                        className="rounded-full size-12 self-center"
                        alt="picture of user"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-12 self-center"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                    <div className="flex flex-col gap-0 self-center">
                      <p className="text-lg truncate max-w-max w-[9.5rem]">
                        {connectedUser.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate w-24 -mt-2">
                        @{connectedUser.id}
                      </p>
                    </div>
                  </div>

                  <button
                    className="text-blue-400 underline justify-self-end"
                    onClick={() => setIsUserSearchPopUp(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {divisions.length !== 0 && (
            <div className="w-full flex flex-col items-center">
              <p className="place-self-start ml-1">Division</p>
              <select
                name=""
                id=""
                value={divisionId}
                onChange={(e) => setDivisionId(e.target.value)}
                className="bg-bg1 w-72 px-2 py-1 rounded-md text-center"
              >
                <option value="none"></option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* boulder scores */}
          <div className="flex flex-col bg-bg1 rounded-sm p-2 gap-2 w-72 place-self-center">
            <p>Boulder Scores Combined</p>
            <div className="flex gap-2 items-center">
              <label htmlFor="" className="text-sm">
                Score:
              </label>
              <input
                type="text"
                name=""
                id=""
                value={tempBoulderScore}
                onChange={handleBoulderScoreChange}
                className="w-16 bg-white text-bg1 rounded-sm px-2  text-sm focus:outline-hidden"
                inputMode="numeric" // Show numeric keyboard on mobile
                pattern="[0-9]*" // Optional: For better mobile support
              />
              <label htmlFor=" " className="text-sm">
                Attempts:
              </label>
              <input
                type="text"
                name=""
                id=""
                value={tempBoulderAttempts}
                onChange={handleBoulderAttemptsChange}
                className="w-10 bg-white text-bg1 rounded-sm px-2 text-sm focus:outline-hidden"
                inputMode="numeric" // Show numeric keyboard on mobile
                pattern="[0-9]*" // Optional: For better mobile support
              />
            </div>
          </div>
          {/* rope scores */}
          <div className="flex flex-col bg-bg1 rounded-sm p-2 gap-2 w-72 place-self-center">
            <p>Ropes Scores Combined</p>
            <div className="flex gap-2 items-center">
              <label htmlFor="" className="text-sm">
                Score:
              </label>
              <input
                type="text"
                name=""
                id=""
                value={tempRopeScore}
                onChange={handleRopeScoreChange}
                className="w-16 bg-white text-bg1 rounded-sm px-2 text-sm focus:outline-hidden"
                inputMode="numeric" // Show numeric keyboard on mobile
                pattern="[0-9]*" // Optional: For better mobile support
              />
              <label htmlFor="" className="text-sm">
                Attempts:
              </label>
              <input
                type="text"
                name=""
                id=""
                value={tempRopeAttempts}
                onChange={handleRopeAttemptsChange}
                className="w-10 bg-white text-bg1 rounded-sm px-2 text-sm focus:outline-hidden "
                inputMode="numeric" // Show numeric keyboard on mobile
                pattern="[0-9]*" // Optional: For better mobile support
              />
            </div>
          </div>
          <div className="flex justify-between">
            {type === 'EDIT' && (
              <button
                className="px-2 py-1 ml-1 bg-red-500 rounded-sm justify-end-start font-normal"
                onClick={() => setIsConfirmationPopUp(true)}
              >
                Delete
              </button>
            )}
            {isSaveButton && (
              <button
                className="px-2 py-1 mr-1 bg-green-500 rounded-sm justify-self-end font-normal"
                onClick={handleSubmit}
              >
                Update Changes
              </button>
            )}
            {type === 'NEW' && (
              <button
                className="px-2 py-1 mr-1 bg-green-500 rounded-sm justify-self-end font-normal"
                onClick={handleNewUserSubmit}
              >
                Add New User
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
