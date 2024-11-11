'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import RoutePanel from './route-panel';
import ConfirmationPopUp from './new_route/confirmation-pop-up';
import Notification from '../notification';

export default function RoutePanels({ routes }) {
  const [isEdit, setIsEdit] = useState(false);
  const [isPopUp, setIsPopUp] = useState(false);
  const [emotion, setEmotion] = useState();
  const [message, setMessage] = useState();

  const [isNotification, setIsNotification] = useState(false);

  const [checkedState, setCheckedState] = useState(
    routes.map((route) => ({ id: route.id, isChecked: false })) // Default unchecked state
  );

  const handleCheckboxChange = (id) => {
    setCheckedState((prevState) =>
      prevState.map((route) =>
        route.id === id ? { ...route, isChecked: !route.isChecked } : route
      )
    );
  };

  const handleDelete = () => {
    if (checkedState.find((route) => route.isChecked)) {
      setIsPopUp(true);
    } else {
      setEmotion('bad');
      setMessage(
        'Please make sure you check at least one route before you hit delete'
      );
      setIsNotification(true);
    }
  };
  const handleQuit = () => {
    setIsNotification(false);
  };
  const handleCancel = () => {
    setIsPopUp(false);
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleConfirmation = async () => {
    const checkedRoutes = checkedState.filter((route) => route.isChecked);
    let checkedRouteIds = [];
    checkedRoutes.forEach((element) => {
      checkedRouteIds.push(element.id);
    });

    try {
      const data = await fetch('/api/delete-route', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routeIds: checkedRouteIds }),
      });

      const response = await data.json();
      setEmotion('happy');
      setMessage(response.message);
      setIsNotification(true);

      await wait(3000);

      window.location.reload();
    } catch (error) {
      const response = await data.json();
      setEmotion('bad');
      setMessage(response.message);
      setIsNotification(true);
    }

    setIsPopUp(false);
  };

  const handleEditClick = () => {
    if (isEdit) {
      setIsEdit(false);
    } else {
      setIsEdit(true);
    }
  };

  return (
    <div className="w-full ">
      {isNotification && (
        <Notification emotion={emotion} message={message} onQuit={handleQuit} />
      )}
      {isPopUp && (
        <ConfirmationPopUp
          message="Are you sure you want to perform this action?"
          submessage="This will delete the selected routes and archive them"
          onConfirmation={handleConfirmation}
          onCancel={handleCancel}
        />
      )}
      <div className="flex justify-between">
        <button
          className="rounded bg-slate-500 text-white font-bold p-2"
          onClick={handleEditClick}
        >
          Edit
        </button>
        {isEdit ? (
          <button
            className="rounded bg-red-500 text-white font-bold p-2 "
            onClick={handleDelete}
          >
            Delete
          </button>
        ) : null}
      </div>
      <hr className="my-4" />

      <div className="flex flex-col gap-2">
        {routes.map((route) => {
          const routeCheckbox = checkedState.find(
            (item) => item.id === route.id
          );
          return (
            <div key={route.id} className="flex items-center ">
              {isEdit ? (
                <input
                  type="checkbox"
                  checked={routeCheckbox.isChecked}
                  onChange={() => handleCheckboxChange(route.id)}
                  className="mr-3 size-10"
                />
              ) : null}
              <RoutePanel
                id={route.id}
                name={route.title}
                grade={route.grade}
                color={route.color}
                date={route.setDate}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
