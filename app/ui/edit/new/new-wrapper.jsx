'use client';
import { useState, useEffect } from 'react';
import NewRoute from '@/app/ui/edit/new/new-route';
import { v4 as uuidv4 } from 'uuid';
import ErrorPopUp from './error-pop-up';
import { useNotification } from '@/app/contexts/NotificationContext';

export default function NewWrapper() {
  const options = ['Route', 'BOTW', 'Event', 'Announcement'];
  const [table, setTable] = useState([]);
  const [data, setData] = useState([]);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleNewOption = (optionText) => {
    if (optionText == 'Route') {
      const newId = uuidv4();
      setTable((prevTable) => [
        ...prevTable,
        <NewRoute
          id={newId}
          key={newId}
          onCommit={handleCommit}
          onUncommit={handleUncommit}
        />,
      ]);
    }
  };

  const handleCommit = (data) => {
    setData((prevData) => [...prevData, data]);
  };

  const handleSubmit = async () => {
    if (data.length < table.length) {
      setErrorMessage('You have Uncommitted Entries, please revise and commit');
      setIsError(true);
    } else {
      try {
        const response = await fetch('/api/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          console.error(response.message);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  const handleCancel = () => {
    setIsError(false);
  };
  const handleUncommit = (id) => {
    // Use functional update to ensure latest state is used
    setData((prevData) => {
      const newData = prevData.filter((item) => item.id !== id);
      return newData; // Return the updated array
    });
  };

  useEffect(() => {
    console.log('data:', data);
  }, [data]);
  return (
    <>
      {isError && <ErrorPopUp message={errorMessage} onCancel={handleCancel} />}
      <div className="p-5 flex-col flex gap-3">
        <h1 className="text-white font-barlow text-4xl">New</h1>
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center overflow-x-auto w-[66%] rounded-r-full">
            {options.map((optionText) => {
              return (
                <button
                  key={optionText}
                  className="bg-green-500 p-1 pr-2 flex font-barlow items-center text-white gap-1 rounded-full justify-between"
                  onClick={() => handleNewOption(optionText)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="size-6 stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  {optionText}
                </button>
              );
            })}
            {/* Gradient Overlay */}
          </div>

          {table.length > 0 && (
            <button className="px-4 py-1 bg-slate-400 text-white font-barlow rounded">
              Edit
            </button>
          )}
        </div>
        <div className="h-1 w-full bg-white rounded-full"></div>
        <div className="flex flex-col gap-2">
          {table.map((option) => {
            return option;
          })}
        </div>

        {table.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="h-1 w-full bg-white rounded-full"></div>
            <div className="flex justify-end">
              <button
                className="p-2 bg-blue-500 text-white font-barlow rounded"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
