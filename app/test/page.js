'use client';

import { useState, useRef } from 'react';

export default function TiktokScroll() {
  const [currentPanel, setCurrentPanel] = useState(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const panels = [
    { id: 1, content: 'Panel 1: Welcome to TikTok-like Scroll' },
    { id: 2, content: 'Panel 2: Swipe Up or Down to Navigate' },
    { id: 3, content: 'Panel 3: Built with React and Tailwind!' },
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
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Panels */}
      <div
        className="h-[calc(100vh-4rem)] w-full transition-transform duration-500"
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
            className="h-screen flex justify-center items-center text-white text-2xl font-bold bg-blue-500"
          >
            {panel.content}
          </div>
        ))}
      </div>
    </div>
  );
}
