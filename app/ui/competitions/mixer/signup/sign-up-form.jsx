'use client';

import { useState } from 'react';
import { useNotification } from '@/app/contexts/NotificationContext';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
export default function SignUpForm({ divisions, user, compId }) {
  const router = useRouter();
  const [selectedDivision, setSelectedDivision] = useState(divisions[0].id);
  const [climberName, setClimberName] = useState(user.name || '');
  const { showNotification } = useNotification();
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const handleSignUp = async () => {
    if (climberName === '' && !isError) {
      showNotification({
        message: 'Please enter a climber name',
        color: 'red',
      });
      return;
    } else if (selectedDivision === '') {
      showNotification({
        message: 'Please select a division',
        color: 'red',
      });
      return;
    } else {
      try {
        const response = await fetch('/api/mixer/user/signup', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.id,
            climberName,
            selectedDivision,
            compId,
          }),
        });
        if (response.ok) {
          showNotification({
            message: 'Signed up successfully',
            color: 'green',
          });
          router.refresh();
        } else {
          showNotification({
            message: `Error in database, could not sign up ${response.error}`,
            color: 'red',
          });
        }
      } catch (error) {
        console.error(error);
        showNotification({
          message: `Error signing up ${error}`,
          color: 'red',
        });
      }
    }
  };

  const handleClimberNameChange = (e) => {
    setClimberName(e.target.value);
    if (e.target.value > 20 || e.target.value < 3) {
      setIsError(true);
      setErrorMessage('Climber name must be between 3 and 20 characters');
    } else {
      setIsError(false);
      setErrorMessage('');
    }
  };
  return (
    <div className="bg-black w-xs rounded md:w-md px-5 py-3 font-barlow flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-white font-bold text-lg">Climber Name</p>
        <input
          type="text"
          value={climberName}
          onChange={handleClimberNameChange}
          placeholder="Climber Name"
          className="w-full p-2 rounded-md bg-bg2 text-white focus:outline-none"
        />
        {isError && (
          <p className="text-red-500 font-bold text-xs">{errorMessage}</p>
        )}
        {user.name !== '' && user.name === climberName && (
          <p className="text-blue-500 font-bold text-xs">
            Autofilled from your account
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-white font-bold text-lg">Division</p>
        <select
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          className="w-full p-2 rounded-md bg-bg2 text-white"
        >
          {divisions.map((division) => (
            <option key={division.id} value={division.id}>
              {division.name}
            </option>
          ))}
        </select>
      </div>
      {user.name !== '' && (
        <button
          className="relative bg-black text-white font-bold text-lg p-2 rounded-md  "
          onClick={handleSignUp}
        >
          Sign Up
          <div
            className="absolute inset-0 opacity-100 rounded-md"
            style={{
              background:
                'radial-gradient(circle at bottom right, #1d4ed8 0%, transparent 40%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-100 rounded-md"
            style={{
              background:
                'radial-gradient(circle at top left, #6b21a8 0%, transparent 40%)',
            }}
          />
        </button>
      )}
    </div>
  );
}
