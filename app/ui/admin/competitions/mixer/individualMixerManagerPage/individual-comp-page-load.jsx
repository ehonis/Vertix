'use client';

import { useState } from 'react';
import { UploadDropzone } from '@/utils/uploadthing';
import InformationalPopUp from '@/app/ui/general/informational-pop-up';
import { clsx } from 'clsx';
import EditRoutePopUp from './mixer-edit-route-popup';
import Image from 'next/image';

export default function IndividualCompPageLoad({
  name,
  imageUrl,
  climbers,
  routes,
  areScoresAvailable,
  compDay,
  time,
  status,
}) {
  const [compRoutes, setCompRoutes] = useState(
    routes.map((route) => ({
      ...route,
      holds: JSON.parse(route.holds), // Convert holds JSON string to array
    }))
  );
  const [selectedDate, setSelectedDate] = useState(
    compDay.toISOString().split('T')[0]
  );
  const [isInfoPopUp, setIsInfoPopUp] = useState(false);
  const [infoPopUpHtml, setInfoPopUpHtml] = useState(<div></div>);
  const [statusOption, setStatusOption] = useState(status);
  const [isNewEditRoutePopUp, setIsNewEditRoutePopup] = useState(false);
  const [isEditRoutePopup, setIsEditRoutePopup] = useState(false);
  const [tempHolds, setTempHolds] = useState();
  const [tempRouteName, setTempRouteName] = useState('');
  const handleInfoStatusButtonClick = () => {
    setIsInfoPopUp(true);
    setInfoPopUpHtml(
      <div className="flex flex-col gap-1">
        <p className="text-sm">
          <span className="text-red-500 text-lg underline">Unavailable:</span>{' '}
          Only admins can see the comp in the comp manager. Use this setting
          when first setting up the comp.
        </p>
        <p className="text-sm">
          <span className="text-orange-400 text-lg underline">Upcoming:</span>{' '}
          Users will be able to see the comp in the comp page, but they can only
          sign up. Please have divisions ready before enabling this status
        </p>
        <p className="text-sm">
          <span className="text-blue-400 text-lg underline">In Progress:</span>
          This will start the comp. Users will be able to submit scores. This
          status will only last for the time allotted to the comp and switch to
          completed when the timer is finished.
        </p>
        <p className="text-sm">
          <span className="text-green-500 text-lg underline">Completed:</span>
          The comp has ended, but the comp is still listed on the comp page.
          Users will be able to see scores/leaderboard, but not enter any scores
        </p>
        <p className="text-sm">
          <span className="text-yellow-400 text-lg underline">Archived:</span>
          The comp has ended, comp is not listed on comp page
        </p>
      </div>
    );
  };
  const handleOnCancelClick = () => {
    setIsInfoPopUp(false);
  };
  const handleEditRoutePopUp = (id) => {
    const tempRoute = compRoutes.find((route) => route.id === id);

    if (tempRoute) {
      setTempHolds(tempRoute.holds);
      setTempRouteName(tempRoute.name);
      setIsEditRoutePopup(true);
    } else {
      console.error(`Route with ID ${id} not found`);
    }
  };

  return (
    <div>
      {isNewEditRoutePopUp && (
        <EditRoutePopUp
          onCancel={() => setIsNewEditRoutePopup(false)}
          holds={null}
        />
      )}
      {isEditRoutePopup && (
        <EditRoutePopUp
          onCancel={() => setIsEditRoutePopup(false)}
          holds={tempHolds}
          routeName={tempRouteName}
        />
      )}
      {isInfoPopUp && (
        <InformationalPopUp
          html={infoPopUpHtml}
          onCancel={handleOnCancelClick}
        />
      )}
      <h2 className="text-4xl mb-3 ">{name}</h2>
      {/*Route Variables*/}
      <div className="bg-bg2 flex-col flex p-3 rounded w-full">
        <div className="flex flex-col  gap-2">
          {/*Comp Image*/}
          <div className="flex justify-between gap-2 bg-bg1 rounded p-2 pr-3 items-center">
            <div className="flex flex-col">
              <label htmlFor="" className="text-xl">
                Comp Image
              </label>
              <label htmlFor="" className="text-sm text-gray-400">
                {'(Tap the image to upload new)'}
              </label>
            </div>
            <button className="bg-bg2 p-5 outline rounded-full my-1">
              {imageUrl === null ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
                  />
                </svg>
              ) : (
                <Image src={imageUrl} />
              )}
            </button>
          </div>
          <div className="flex gap-2 bg-bg1 rounded p-2 justify-between items-center">
            <div className="flex items-center">
              <label htmlFor="" className="text-xl">
                Status
              </label>
              <button onClick={handleInfoStatusButtonClick}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </button>
            </div>
            <select
              name=""
              id=""
              value={statusOption}
              onChange={(e) => setStatusOption(e.target.value)}
              className={clsx(
                'px-1 py-1 bg-bg1 rounded-md',
                statusOption === 'upcoming' && 'bg-orange-400',
                statusOption === 'unavailable' && 'bg-red-500',
                statusOption === 'inprogress' && 'bg-blue-500',
                statusOption === 'completed' && 'bg-green-500',
                statusOption === 'archived' && 'bg-yellow-400'
              )}
            >
              <option value="upcoming">Upcoming</option>
              <option value="unavailable">Unavailable</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex gap-2 bg-bg1 rounded p-2 justify-between items-center">
            <label htmlFor="" className="text-lg">
              Comp Day
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={selectedDate} // Controlled value
              onChange={(e) => setSelectedDate(e.target.value)} // Update state on change
              className="p-1 rounded-lg bg-bg2 text-white cursor-pointer font-barlow font-bold"
            />
          </div>
          {/* <UploadDropzone
            className="ut-button:max-w-xs ut- ut-l"
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              console.log('Files:', res);
              alert('Upload Completed');
            }}
            onUploadError={(error) => {
              alert(`ERROR! ${error.message}`);
            }}
          /> */}
        </div>
      </div>
      <h3 className="text-3xl mt-3">Routes</h3>
      <div className="bg-bg2 flex-col gap-2 flex p-3 rounded w-full">
        {compRoutes.length > 0 ? (
          <div className="w-full flex-col flex gap-2">
            {compRoutes.map((route) => (
              <button
                key={route.id}
                className={clsx(
                  ' flex p-1 rounded',
                  route.color === 'red' && 'bg-red-500',
                  route.color === 'blue' && 'bg-blue-500',
                  route.color === 'green' && 'bg-green-400',
                  route.color === 'orange' && 'bg-orange-500',
                  route.color === 'yellow' && 'bg-yellow-500'
                )}
                onClick={() => handleEditRoutePopUp(route.id)}
              >
                <div className="grid bg-bg1 grid-cols-2 items-center p-1 px-2 w-full rounded">
                  <p className="text-xl place-self-start">{route.name}</p>
                  <p className="text-xl place-self-end">
                    Holds: {route.holds.length}
                  </p>
                </div>
              </button>
            ))}
            <div className="flex items-center gap-1">
              <button
                className="bg-green-400 p-1 rounded-full max-w-fit"
                onClick={() => setIsNewEditRoutePopup(!isNewEditRoutePopUp)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-7 "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </button>
              <p>Add Route</p>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
