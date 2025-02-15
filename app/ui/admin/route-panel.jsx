'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { formatDateString } from '@/lib/dates';
import useScrollAnimation from '@/app/hooks/useScrollAnimation';

export default function RoutePanel({ id, name, grade, date, color }) {
  const [elementRef, isVisible] = useScrollAnimation(0.1);

  // Format the date using routeScripts helper
  date = formatDateString(date);

  return (
    <Link
      href={`admin/routes/${id}`}
      key={id}
      ref={elementRef}
      className={clsx(
        'h-16 w-full bg-bg2 rounded flex justify-between items-center pr-4 py-2 space-x-4 transition-all duration-500 transform',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      )}
    >
      {/* Color block and name */}
      <div className="flex items-center space-x-4 w-56 md:flex-grow">
        {/* Color block */}
        <div
          className={clsx(
            'h-16 w-4 rounded-l overflow-hidden',
            {
              'bg-green-400': color === 'green',
              'bg-red-400': color === 'red',
              'bg-blue-400': color === 'blue',
              'bg-yellow-400': color === 'yellow',
              'bg-purple-400': color === 'purple',
              'bg-orange-400': color === 'orange',
              'bg-white': color === 'white',
              'bg-black': color === 'black',
              'bg-slate-400': color === 'defaultColor',
              'bg-pink-400': color === 'pink',
            } // Using clsx for dynamic color
          )}
        ></div>

        {/* Route name, taking up remaining space */}
        <p className="text-white text-lg font-bold break-words whitespace-nowrap overflow-hidden text-ellipsis w-32">
          {name}
        </p>
      </div>

      {/* Grade and Date aligned on the right */}
      <div className="flex space-x-2 items-center">
        <p className="text-white font-extrabold">{grade}</p>

        {/* Divider */}
        <div className="w-[2px] h-12 bg-white"></div>

        <p className="text-white font-bold">{date}</p>
      </div>
    </Link>
  );
}
