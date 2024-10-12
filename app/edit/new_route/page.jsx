'use client';
import { useState } from 'react';
import GradeSelect from '@/app/ui/edit/new_route/grade-select';
import ConfirmationPopUp from '@/app/ui/edit/new_route/confirmation-pop-up';
import { findType } from '@/lib/routeScripts';
import Notification from '@/app/ui/notification';

export default function page() {
  const [isNotification, setNotification] = useState(false);
  const [emotion, setEmotion] = useState();
  const [message, setMessage] = useState();
  const [isPopUp, setIsPopUp] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [grade, setGrade] = useState('');

  const handleRouteNameChange = (event) => setRouteName(event.target.value);
  const handleGradeChange = (selectedGrade) => setGrade(selectedGrade);

  const handleSubmit = () => {
    setIsPopUp(true);
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
        body: JSON.stringify({ routeName, grade, type }),
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

  return (
    <>
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
      <div className="mt-32 bg-[#181a1c] mx-24  flex items-center justify-center py-10 rounded-3xl">
        <div className="flex w-1/2 flex-col justify-center overflow-hidden rounded-3xl bg-bg1 p-5 bg-[#3d4349] shadow-md">
          <h1 className="mb-5 text-center text-3xl font-bold text-[#181a1c] ">
            Create A New Route
          </h1>
          <div className="flex flex-col items-center gap-3">
            <input
              type="text"
              placeholder="Route Name"
              className="w-3/4 rounded-lg bg-[#202224] p-2 text-white"
              value={routeName}
              onChange={handleRouteNameChange}
            />
            <div className="flex justify-start w-3/4 my-2">
              <GradeSelect onGradeChange={handleGradeChange} />
            </div>
            <div className="flex justify-end w-3/4">
              <button
                onClick={handleSubmit}
                className="mt-4 rounded-lg bg-blue-500 p-2 text-white"
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
