'use client';

import { useState, useRef } from 'react';
import clsx from 'clsx';

export default function Scroll() {
  const [currentPanel, setCurrentPanel] = useState(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const panels = [
    { id: 1, content: 'Panel 1' },
    { id: 2, content: 'Panel 2' },
    { id: 3, content: 'Panel 3' },
  ];

  const handleSwipe = () => {
    const swipeDistance = touchStartY.current - touchEndY.current;
    if (swipeDistance > 50 && currentPanel < panels.length - 1) {
      // Swipe Up
      setCurrentPanel(currentPanel + 1);
    } else if (swipeDistance < -50 && currentPanel > 0) {
      // Swipe Down
      setCurrentPanel(currentPanel - 1);
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    handleSwipe();
  };

  return (
    <div className="absolute w-screen overflow-hidden">
      {/* Panels */}
      <div
        className="h-screen w-full transition-transform duration-500"
        style={{
          transform: `translateY(-${currentPanel * 100}%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {panels.map((panel) => (
          <div
            key={panel.id}
            className={clsx(
              'h-full flex justify-center items-center text-white text-2xl font-bold',
              panel.id === 1 ? 'bg-red-500' : null,
              panel.id === 2 ? 'bg-blue-500' : null,
              panel.id === 3 ? 'bg-green-500' : null
            )}
          >
            {panel.content}
          </div>
        ))}
      </div>
    </div>
  );
}
