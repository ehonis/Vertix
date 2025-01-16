'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import clsx from 'clsx';
import { useState, useRef } from 'react';
import 'swiper/css';
import CountdownTimer from './count-down-timer';

const panels = [
  { id: 1, content: '1000', color: 'blue' },
  { id: 2, content: '2000', color: 'red' },
  { id: 3, content: '3000', color: 'green' },
  { id: 4, content: '4000', color: 'red' },
  { id: 5, content: '5000', color: 'red' },
];

export default function ScoreTaker() {
  const [attempts, setAttempts] = useState(() =>
    panels.reduce((acc, panel) => {
      acc[panel.id] = 0; // Default value for each panel
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

  const handleRangeChange = (value) => {
    setRangeValue(value);
    if (swiperRef.current) {
      swiperRef.current.slideTo(value);
    }
  };

  return (
    <div>
      <CountdownTimer />
      <div className="flex flex-col items-center justify-center mb-1">
        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max={panels.length - 1}
          step="1"
          value={rangeValue}
          onChange={(e) => handleRangeChange(Number(e.target.value))}
          className="w-3/4 mb-2 appearance-none bg-gray-300 rounded h-2"
        />

        {/* Slider Labels */}
        <div className="flex justify-between w-3/4 text-sm text-gray-400">
          <span className="text-left font-barlow">{panels[0].content}</span>{' '}
          {/* Start */}
          <span className="text-center font-barlow">
            {panels[Math.floor(panels.length / 2)].content}
          </span>{' '}
          {/* Middle */}
          <span className="text-right font-barlow">
            {panels[panels.length - 1].content}
          </span>{' '}
          {/* End */}
        </div>
      </div>

      <Swiper
        direction="vertical"
        spaceBetween={50}
        slidesPerView={1}
        onSwiper={(swiper) => (swiperRef.current = swiper)} // Get Swiper instance
        onSlideChange={(swiper) => setRangeValue(swiper.activeIndex)} // Sync slider with Swiper
        className="h-[calc(100vh-18rem)] rounded"
      >
        {panels.map((panel) => (
          <SwiperSlide key={panel.id} className="p-8 pt-6 rounded-lg">
            <div className="flex flex-col p-5 pt-8 items-center h-full rounded-lg bg-black shadow-xl text-white text-2xl gap-5 justify-between">
              {/* header */}
              <div>
                <h1
                  className={clsx(
                    'font-iceland text-9xl',
                    panel.color === 'blue' ? 'text-blue-500' : null,
                    panel.color === 'green' ? 'text-green-500' : null,
                    panel.color === 'red' ? 'text-red-500' : null
                  )}
                >
                  {panel.content}
                </h1>
                {/* attempts */}
                <div className="flex flex-col items-center gap-3">
                  <label htmlFor="" className="font-barlow text-3xl text-white">
                    Attempts
                  </label>
                  <div className="flex items-center gap-6">
                    <button
                      className="rounded-full size-14 font-barlow bg-red-500 flex justify-center items-center"
                      onClick={() => handleMinusAttempt(panel.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={attempts[panel.id]}
                      onChange={(e) => handleChange(panel.id, e)}
                      className="border p-2 text-black font-barlow w-14 h-14 text-3xl rounded text-center"
                      placeholder="#"
                    />
                    <button
                      className="rounded-full size-14 font-barlow bg-green-500  flex justify-center items-center"
                      onClick={() => handlePlusAttempt(panel.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={5}
                        stroke="currentColor"
                        className="size-6"
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
              {/* completion */}
              <div className="flex flex-col gap-3 items-center">
                <button className="bg-green-500 rounded-full size-16 flex justify-center items-center">
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
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
