'use client';

import Link from 'next/link';
import RouteTile from './routeTile';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/app/contexts/NotificationContext';

export default function FilteredRoutes({
  filter,
  ropes,
  boulders,
  user,
  completions,
}) {
  const { showNotification } = useNotification();
  const router = useRouter();
  console.log(filter);
  const postRouteCompletion = async (userId, routeId, routeName) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/add-route-completion`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId, routeId: routeId }),
        }
      );
      if (response.ok) {
        showNotification({
          message: `Quick Completed ${routeName}`,
          color: 'green',
        });
      } else {
        showNotification({
          message: `Could Not Quick Complete ${routeName} w/ erorr : ${response.error}`,
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({ message: `error:${error}`, color: red });
      console.error(error);
    }
    router.refresh();
  };

  const postRouteUnCompletion = async (userId, routeId, routeName) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/remove-route-completion`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId, routeId: routeId }),
        }
      );
      if (response.ok) {
        showNotification({
          message: `Uncompleted ${routeName}`,
          color: 'green',
        });
      } else {
        showNotification({
          message: `Could Not Uncomplete ${routeName}, w/ error: ${response.error}`,
        });
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuickCompletion = async (routeId, routeName) => {
    postRouteCompletion(user.id, routeId, routeName);
  };
  const handleQuickUncomplete = async (routeId, routeName) => {
    postRouteUnCompletion(user.id, routeId, routeName);
  };
  let completedRouteIds = {};

  if (user) {
    try {
      completedRouteIds = completions.map((completion) => completion.routeId);
    } catch (error) {
      console.error('failed getting route completions. Error:', error);
    }
  }
  return (
    <div className="flex md:flex-row flex-col gap-5 p-5">
      <div className="bg-bg1 w-max h-full flex-grow rounded-xl">
        <div className="p-3">
          <h2 className="text-white font-bold text-3xl">Ropes</h2>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {ropes.map((route) => {
            return (
              <div className="flex items-center gap-2" key={route.id}>
                <Link href={`routes/${route.id}`}>
                  <RouteTile
                    color={route.color}
                    name={route.title}
                    grade={route.grade}
                  />
                </Link>
                {user && !completedRouteIds.includes(route.id) ? (
                  <button
                    onClick={() => handleQuickCompletion(route.id, route.title)}
                    className="bg-slate-500 size-10 flex items-center justify-center rounded-full group hover:bg-green-400 transition-all duration-300 relative"
                  >
                    <span className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Quick Complete
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      className="size-8 stroke-white group-hover:size-9"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </button>
                ) : null}
                {user && completedRouteIds.includes(route.id) ? (
                  <button
                    onClick={() => handleQuickUncomplete(route.id, route.title)}
                    className="bg-green-500 size-10 flex items-center justify-center rounded-full group hover:bg-red-400 transition-all duration-300 relative"
                  >
                    <span className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Uncomplete
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      className="size-8 stroke-white group-hover:size-9"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-bg1 w-max h-full flex-grow rounded-xl">
        <div className="p-3">
          <h2 className="text-white font-bold text-3xl">Boulders</h2>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {boulders.map((route) => {
            return (
              <div className="flex items-center gap-2" key={route.id}>
                <Link href={`routes/${route.id}`}>
                  <RouteTile
                    color={route.color}
                    name={route.title}
                    grade={route.grade}
                  />
                </Link>
                {user && !completedRouteIds.includes(route.id) ? (
                  <button
                    onClick={() => handleQuickCompletion(route.id, route.title)}
                    className="bg-slate-500 size-10 flex items-center justify-center rounded-full group hover:bg-green-400 transition-all duration-300 relative"
                  >
                    <span className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Quick Complete
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      className="size-8 stroke-white group-hover:size-9"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </button>
                ) : null}
                {user && completedRouteIds.includes(route.id) ? (
                  <button
                    onClick={() => handleQuickUncomplete(route.id, route.title)}
                    className="bg-green-500 size-10 flex items-center justify-center rounded-full group hover:bg-red-400 transition-all duration-300 relative"
                  >
                    <span className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Uncomplete
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      className="size-8 stroke-white group-hover:size-9"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
