'use client';

import Link from 'next/link';
import RouteTile from './routeTile';
import { useState } from 'react';
import Notification from '../notification';
import { useRouter } from 'next/navigation';

export default function RouteTiles({ ropes, boulders, user, completions }) {
  const router = useRouter();
  const [isNotification, setNotification] = useState(false);
  const [emotion, setEmotion] = useState();
  const [message, setMessage] = useState();
  console.log(user);

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
        setEmotion('happy');
        setMessage(`Completed ${routeName}`);
        setNotification(true);
      } else {
        setEmotion('bad');
        setMessage(
          `Could not completed ${routeName}, error : ${response.error}`
        );
        setNotification(true);
      }
    } catch (error) {
      setEmotion('bad');
      setMessage(error);
      setNotification(true);
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
        setEmotion('happy');
        setMessage(`Uncompleted ${routeName}`);
        setNotification(true);
      } else {
        setEmotion('bad');
        setMessage(
          `Could not Uncompleted ${routeName}, error : ${response.error}`
        );
        setNotification(true);
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
  const handleQuit = () => {
    setNotification(false);
  };
  if (user) {
    const completedRouteIds = completions.map(
      (completion) => completion.routeId
    );

    return (
      <>
        {isNotification && (
          <Notification
            emotion={emotion}
            message={message}
            onQuit={handleQuit}
          />
        )}
        <div className="flex flex-col h-screen">
          <div className="flex justify-between px-5 pt-5 pb-1">
            <h1 className="text-white font-bold text-3xl">Routes</h1>
            {/* <div>
            <button className="relative bg-transparent text-white outline outline-1 outline-white px-3 overflow-hidden group ">
              <span className="absolute inset-0 bg-white transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></span>
              <span className="relative group-hover:text-black transition-all duration-500">
                Filter
              </span>
            </button>
          </div>
          <div className="flex gap-5">
            <button className="relative bg-transparent text-white outline outline-1 outline-white px-3 overflow-hidden group ">
              <span className="absolute inset-0 bg-white transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></span>
              <span className="relative group-hover:text-black transition-all duration-500">
                Search
              </span>
            </button>
            <button className="relative bg-transparent text-white outline outline-1 outline-white px-3 overflow-hidden group ">
              <span className="absolute inset-0 bg-white transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></span>
              <span className="relative group-hover:text-black transition-all duration-500">
                quickFilter
              </span>
            </button>
          </div> */}
          </div>
          <div className="flex gap-5 p-5">
            <div className="bg-bg1 w-max h-full rounded-xl">
              <div className="p-4">
                <h2 className="text-white font-bold text-3xl">Ropes</h2>
              </div>
              <div className="p-4 flex flex-col gap-2">
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
                          onClick={() =>
                            handleQuickCompletion(route.id, route.title)
                          }
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
                          onClick={() =>
                            handleQuickUncomplete(route.id, route.title)
                          }
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
            <div className="bg-bg1 w-max h-full rounded-xl">
              <div className="p-4">
                <h2 className="text-white font-bold text-3xl">Boulders</h2>
              </div>
              <div className="p-4 flex flex-col gap-2">
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
                          onClick={() =>
                            handleQuickCompletion(route.id, route.title)
                          }
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
                          onClick={() =>
                            handleQuickUncomplete(route.id, route.title)
                          }
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
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="flex flex-col h-screen">
          <div className="flex justify-between px-5 pt-5 pb-1">
            <h1 className="text-white font-bold text-3xl">Routes</h1>
          </div>
          <div className="flex gap-5 p-5">
            <div className="bg-bg1 w-max h-full rounded-xl">
              <div className="p-4">
                <h2 className="text-white font-bold text-3xl">Ropes</h2>
              </div>
              <div className="p-4 flex flex-col gap-2">
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
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-bg1 w-max h-full rounded-xl">
              <div className="p-4">
                <h2 className="text-white font-bold text-3xl">Boulders</h2>
              </div>
              <div className="p-4 flex flex-col gap-2">
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
