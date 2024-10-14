'use client';

import RoutePanel from '../ui/edit/route-panel';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Page() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const getRoutes = async () => {
      try {
        const response = await fetch('/api/get-route', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setRoutes(data);
      } catch (error) {
        console.error(error);
      }
    };
    getRoutes();
  }, []);

  return (
    <>
      <div className="flex justify-between w-full p-5">
        <h1 className="text-white text-3xl font-bold">Edit Routes</h1>
        <Link href={'./edit/new_route'}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="#4ade80"
            className="size-14"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </Link>
      </div>
      <div className="bg-bg1 m-5 rounded">
        <h2 className="text-white text-xl font-bold px-5">Ropes</h2>
        <div className="flex flex-col gap-5 p-5">
          <RoutePanel />
          <RoutePanel />
          <RoutePanel />
          <RoutePanel />
          <RoutePanel />
        </div>
      </div>
      <div className="bg-bg1 m-5 rounded">
        <h2 className="text-white text-xl font-bold px-5 p">Boulders</h2>
        <div className="flex flex-col gap-5 p-5">
          <RoutePanel />
          <RoutePanel />
          <RoutePanel />
          <RoutePanel />
          <RoutePanel />
        </div>
      </div>
    </>
  );
}
