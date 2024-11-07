'use client';

import { useState } from 'react';
import clsx from 'clsx';
import FunctionButtonMenu from './menus/function-button-menu';

export default function FunctionButton({
  route,
  userId,
  isComplete,
  isGraded,
}) {
  const [isButtonActive, setIsButtonActive] = useState(false);

  const handleButtonClick = () => {
    setIsButtonActive(!isButtonActive);
  };
  return (
    <div className="flex items-center">
      <button
        className=" justify-center rounded-full items-center flex"
        onClick={handleButtonClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-12 stroke-green-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>
      {isButtonActive ? (
        <FunctionButtonMenu
          onCancel={handleButtonClick}
          route={route}
          userId={userId}
          isComplete={isComplete}
          isGraded={isGraded}
        />
      ) : null}
    </div>
  );
}
