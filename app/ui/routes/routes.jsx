'use client';

import Link from 'next/link';
import RouteTile from './routeTile';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/app/contexts/NotificationContext';
import DefaultRoutes from './default-routes';
import TopDown from './topdown';

export default function Routes({ ropes, boulders, user, completions }) {
  const [activeWall, setActiveWall] = useState(null);

  const handleData = (data) => {
    setActiveWall(data);
  };
  useEffect(() => {
    console.log(activeWall);
  }, [activeWall]);

  return (
    <>
      <div className="p-5">
        <div className="bg-bg1 flex items-center p-4 rounded-xl">
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-white">Filter By Route Section!</h3>
            <div className="bg-bg2 flex flex-col pl-3 pr-4 py-1 rounded-xl">
              <TopDown onData={handleData} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-screen">
        <div className="flex justify-between px-5 pb-1">
          <h1 className="text-white font-bold text-3xl">Current Set</h1>
        </div>
        {activeWall === null ? (
          <DefaultRoutes
            ropes={ropes}
            boulders={boulders}
            user={user}
            completions={completions}
          />
        ) : null}
      </div>
    </>
  );
}
