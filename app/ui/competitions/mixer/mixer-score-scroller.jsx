'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import clsx from 'clsx';
import { useState, useRef, useEffect } from 'react';
import 'swiper/css';
import MixerCountdownTimer from './mixer-count-down-timer';
import { useNotification } from '@/app/contexts/NotificationContext';
import TypeToggleSwitch from './mixer-type-toggle';
import { getPoints } from '@/lib/mixer';
import MixerInfoPopup from './mixer-info-popup';

export default function MixerScoreScroller({ mixerRoutes, StartTime }) {
  const [tempRouteId, setTempRouteId] = useState('');
  const { showNotification } = useNotification();
  const [isInfoPopup, setIsInfoPopup] = useState(false);
  const [category, setCategory] = useState('Rope');
  const [attempts, setAttempts] = useState(() =>
    mixerRoutes.reduce((acc, panel) => {
      acc[panel.id] = 0; // Default value for each panel
      return acc;
    }, {})
  );
  const [hold, setHold] = useState(() =>
    mixerRoutes.reduce((acc, panel) => {
      acc[panel.id] = 0; // Default value for each panel
      return acc;
    }, {})
  );
  const [completions, setCompletions] = useState(() =>
    mixerRoutes.reduce((acc, panel) => {
      acc[panel.id] = false;
      return acc;
    }, {})
  );
  const [points, setPoints] = useState(() =>
    mixerRoutes.reduce((acc, panel) => {
      acc[panel.id] = null;
      return acc;
    }, {})
  );
  const [typeToggles, setTypeToggles] = useState(() =>
    mixerRoutes.reduce((acc, panel) => {
      acc[panel.id] = 'TR'; // Default to 'Top Rope' for each panel
      return acc;
    }, {})
  );
  const [rangeValue, setRangeValue] = useState(0); // Range slider value
  const swiperRef = useRef(null); // Ref to control Swiper instance

  const handleChange = (panelId, e) => {
    const inputValue = e.target.value;
    const sanitizedValue = inputValue.replace(/[^0-9]/g, '');
    setAttempts((prev) => ({
      ...prev,
      [panelId]: Math.min(Number(sanitizedValue), 20),
    }));
  };

  const handlePlusAttempt = (panelId) => {
    setAttempts((prev) => ({
      ...prev,
      [panelId]: Math.min(prev[panelId] + 1, 20),
    }));
  };
  const handleMinusAttempt = (panelId) => {
    setAttempts((prev) => ({
      ...prev,
      [panelId]: Math.max(prev[panelId] - 1, 0),
    }));
  };

  const handlePlusHold = (panelId, maxHold) => {
    setHold((prev) => {
      const newHoldValue = Math.min(prev[panelId] + 1, maxHold);

      // Update the points for the current hold value
      const type =
        typeToggles[panelId] === 'TR' ? 'topRopePoints' : 'leadPoints';
      setPoints((prevPoints) => ({
        ...prevPoints,
        [panelId]: getPoints(mixerRoutes, panelId, newHoldValue, type),
      }));

      return {
        ...prev,
        [panelId]: newHoldValue,
      };
    });
  };
  const handleMinusHold = (panelId) => {
    setHold((prev) => {
      const newHoldValue = Math.max(prev[panelId] - 1, 0);

      // Update the points for the current hold value
      if (newHoldValue >= 0) {
        const type =
          typeToggles[panelId] === 'TR' ? 'topRopePoints' : 'leadPoints';
        setPoints((prevPoints) => ({
          ...prevPoints,
          [panelId]: getPoints(mixerRoutes, panelId, newHoldValue, type),
        }));
      }

      return {
        ...prev,
        [panelId]: newHoldValue,
      };
    });
  };

  const handleTypeChange = (panelId, value) => {
    setTypeToggles((prev) => {
      const newTypeValue = value;

      const type = newTypeValue === 'TR' ? 'topRopePoints' : 'leadPoints';
      setPoints((prevPoints) => ({
        ...prevPoints,
        [panelId]: getPoints(mixerRoutes, panelId, hold[panelId], type),
      }));

      return {
        ...prev,
        [panelId]: newTypeValue,
      }; // Update the type toggle for the specific panel
    });
  };

  const handleRangeChange = (value) => {
    setRangeValue(value);
    if (swiperRef.current) {
      swiperRef.current.slideTo(value);
    }
  };

  const handleCompletion = (panelId, attempts, points) => {
    if (attempts < 1) {
      showNotification({
        message: `1 Attempt Needed`,
        color: 'red',
      });
    } else if (points === null) {
      showNotification({
        message: `1 Hold Needed`,
        color: 'red',
      });
    } else {
      setCompletions((prev) => ({
        ...prev,
        [panelId]: true,
      }));
    }
  };
  const handleUncompletion = (panelId) => {
    setCompletions((prev) => ({
      ...prev,
      [panelId]: false,
    }));
  };
  const handleInfoClick = (routeId) => {
    setTempRouteId(routeId);
    setIsInfoPopup(!isInfoPopup);
  };
  const handleCancel = () => {
    setIsInfoPopup(false);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
  };

  return (
    <div>
      <div className="flex justify-between w-full">
        <MixerCountdownTimer />
        <button className=" absolute right-0 text-sm flex items-center justify-center gap-1">
          <div className="bg-green-500 rounded-bl-lg p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
        </button>
      </div>
      <div className="flex flex-col px-5 py-5">
        <div className="mb-3">
          <TypeToggleSwitch
            leftLabel={'Boulder'}
            rightLabel={'Rope'}
            value={category}
            onTypeSwitchValue={(value) => handleCategoryChange(value)}
          />
        </div>
        <div className="flex flex-col items-center justify-center">
          {/* Range Slider */}
          <input
            type="range"
            min="0"
            max={mixerRoutes.length - 1}
            step="1"
            value={rangeValue}
            onChange={(e) => handleRangeChange(Number(e.target.value))}
            className="w-3/4 mb-2 appearance-none bg-gray-300 rounded h-2"
          />

          {/* Slider Labels */}
          <div className="flex justify-between w-3/4 text-sm text-gray-400">
            <span className="text-left font-barlow font-bold">
              {mixerRoutes[0].routeName}
            </span>{' '}
            {/* Start */}
            <span className="text-center font-barlow font-bold">
              {mixerRoutes[Math.floor(mixerRoutes.length / 2)].routeName}
            </span>{' '}
            {/* Middle */}
            <span className="text-right font-barlow font-bold">
              {mixerRoutes[mixerRoutes.length - 1].routeName}
            </span>{' '}
            {/* End */}
          </div>
        </div>
      </div>
      {/* Panel Swiper*/}
      <Swiper
        direction="vertical"
        spaceBetween={50}
        slidesPerView={1}
        onSwiper={(swiper) => (swiperRef.current = swiper)} // Get Swiper instance
        onSlideChange={(swiper) => setRangeValue(swiper.activeIndex)} // Sync slider with Swiper
        className="h-[calc(100vh-15rem)] rounded"
      >
        {isInfoPopup ? (
          <MixerInfoPopup
            mixerRoutes={mixerRoutes}
            holds={hold}
            points={points}
            completions={completions}
            onCancel={handleCancel}
            routeId={tempRouteId}
          />
        ) : null}
        {mixerRoutes.map((panel) => (
          <SwiperSlide key={panel.id} className="p-8 pt-2 rounded-lg">
            {completions[panel.id] === false ? (
              <div
                className={clsx(
                  'relative flex flex-col p-5 pt-6 items-center h-full rounded-lg bg-black shadow-blue-500 shadow-xl text-white text-2xl gap-5 justify-between',
                  panel.color === 'blue' ? 'shadow-blue-500' : null,
                  panel.color === 'red' ? 'shadow-red-500' : null,
                  panel.color === 'green' ? 'shadow-green-400' : null,
                  panel.color === 'orange' ? 'shadow-orange-500' : null,
                  panel.color === 'yellow' ? 'shadow-yellow-400' : null
                )}
              >
                <button
                  className="absolute top-0 right-1 rounded-full size-10"
                  onClick={() => handleInfoClick(panel.id)}
                >
                  <div className="flex justify-center items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-7 self-center align-middle"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                      />
                    </svg>
                  </div>
                </button>
                <div className="flex flex-col gap-3">
                  {/* header */}
                  <div className="flex flex-col gap-2">
                    <h1
                      className={clsx(
                        'font-orbitron font-bold text-5xl text-center ',
                        panel.color === 'blue' ? 'text-blue-500' : null,
                        panel.color === 'green' ? 'text-green-400' : null,
                        panel.color === 'orange' ? 'text-orange-500' : null,
                        panel.color === 'yellow' ? 'text-yellow-300' : null,
                        panel.color === 'red' ? 'text-red-500' : null
                      )}
                    >
                      {panel.routeName}
                    </h1>
                    <TypeToggleSwitch
                      leftLabel={'TR'}
                      rightLabel={'Lead'}
                      value={typeToggles[panel.id]}
                      onTypeSwitchValue={(value) =>
                        handleTypeChange(panel.id, value)
                      }
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <label
                      htmlFor=""
                      className="font-barlow font-bold text-2xl text-white"
                    >
                      Hold {'#'}
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        className="rounded-full size-10 font-barlow font-bold bg-red-500 flex justify-center items-center"
                        onClick={() => handleMinusHold(panel.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={5}
                          stroke="currentColor"
                          className="size-4"
                          style={{
                            filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))',
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14"
                          />
                        </svg>
                      </button>
                      <input
                        type="text"
                        value={hold[panel.id]}
                        onChange={(e) => handleChange(panel.id, e)}
                        className="border p-2 text-black font-barlow font-bold size-10 text-2xl rounded text-center"
                        placeholder="#"
                      />
                      <button
                        className="rounded-full size-10 font-barlow font-bold bg-green-500  flex justify-center items-center"
                        onClick={() =>
                          handlePlusHold(panel.id, panel.holds.length)
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={5}
                          stroke="currentColor"
                          className="size-4"
                          style={{
                            filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))',
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-stalinist gradient-text-yellow-red text-4xl text-center">
                    {points[panel.id] > 0 ? points[panel.id] : 0}
                  </p>
                  <p className="font-stalinist gradient-text-yellow-red text-xl">
                    Points
                  </p>
                </div>
                <div className="flex flex-col gap-8">
                  {/* attempts */}
                  <div className="flex flex-col items-center gap-3">
                    <label
                      htmlFor=""
                      className="font-barlow font-bold text-2xl text-white"
                    >
                      Attempts
                    </label>
                    <div className="flex items-center gap-6">
                      <button
                        className="rounded-full size-10 font-barlow font-bold bg-red-500 flex justify-center items-center"
                        onClick={() => handleMinusAttempt(panel.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={5}
                          stroke="currentColor"
                          className="size-4"
                          style={{
                            filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))',
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14"
                          />
                        </svg>
                      </button>
                      <input
                        type="text"
                        value={attempts[panel.id]}
                        onChange={(e) => handleChange(panel.id, e)}
                        className="border p-2 text-black font-barlow font-bold size-10 text-2xl rounded text-center"
                        placeholder="#"
                      />
                      <button
                        className="rounded-full size-10 font-barlow font-bold bg-green-500  flex justify-center items-center"
                        onClick={() => handlePlusAttempt(panel.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={5}
                          stroke="currentColor"
                          className="size-4"
                          style={{
                            filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))',
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* completion */}
                  <div className="flex flex-col gap-3 items-center">
                    <button
                      className="bg-green-500 rounded-full size-16 flex justify-center items-center"
                      onClick={() =>
                        handleCompletion(
                          panel.id,
                          attempts[panel.id],
                          points[panel.id]
                        )
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-14"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* complete panel */}
                <div
                  className={clsx(
                    'flex flex-col p-4 items-center h-full rounded-lg gradient-background-green shadow-xl text-white text-2xl gap-5 justify-between ',
                    panel.color === 'blue' ? 'shadow-blue-500' : null,
                    panel.color === 'red' ? 'shadow-red-500' : null,
                    panel.color === 'orange' ? 'shadow-orange-500' : null,
                    panel.color === 'yellow' ? 'shadow-yellow-400' : null
                  )}
                >
                  <div className="flex flex-col justify-between p-3 bg-bg1 rounded-lg h-full w-full">
                    <div>
                      <h1
                        className={clsx(
                          'font-orbitron font-bold text-6xl text-center mb-2 drop-shadow-customBlack',
                          panel.color === 'blue' ? 'text-blue-500' : null,
                          panel.color === 'orange' ? 'text-orange-500' : null,
                          panel.color === 'yellow' ? 'text-yellow-300' : null,
                          panel.color === 'red' ? 'text-red-500' : null
                        )}
                      >
                        {panel.routeName}
                      </h1>
                      <p className="font-orbitron font-bold gradient-text-green-lime text-center">
                        Completed
                      </p>
                    </div>
                    <p className="font-barlow font-bold text-center text-4xl">
                      {typeToggles[panel.id] === 'TR' ? 'Top Rope' : 'Lead'}
                    </p>
                    <div className="flex flex-col gap-2">
                      <p className="font-stalinist gradient-text-yellow-red text-6xl text-center drop-shadow-customBlack">
                        {points[panel.id]}
                      </p>
                      <p className="font-stalinist gradient-text-yellow-red text-xl text-center drop-shadow-customBlack">
                        Points
                      </p>
                    </div>
                    <div className="flex flex-col gap-5">
                      {attempts[panel.id] !== 1 ? (
                        <p className="font-barlow font-bold text-white text-2xl text-center drop-shadow-customBlack">
                          {attempts[panel.id]} attempts
                        </p>
                      ) : (
                        <p className="font-barlow font-bold text-white text-4xl text-center drop-shadow-customBlack">
                          Flash!
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <h2 className="text-2xl font-barlow font-bold text-white text-center drop-shadow-customBlack">
                        Uncomplete?
                      </h2>
                      <button
                        className="rounded-full size-14 font-barlow font-bold bg-red-500 flex justify-center items-center shadow-lg drop-shadow-customBlack"
                        onClick={() => handleUncompletion(panel.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-10 "
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
