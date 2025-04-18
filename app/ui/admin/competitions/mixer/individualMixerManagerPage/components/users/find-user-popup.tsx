"use client";

import { motion } from "motion/react";
import { useState, useCallback, useMemo } from "react";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import clsx from "clsx";
import { User } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

type FindUserPopUpData = {
  onConnectUser: (user: User) => void;
  onCancel: () => void;
};
export default function FindUserPopUp({ onConnectUser, onCancel }: FindUserPopUpData) {
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<User>();
  const [isConnectButton, setIsConnectButton] = useState(false);

  const findUsers = useCallback(async (text: string) => {
    setSelectedUser(undefined);
    setIsConnectButton(false);
    if (!text) {
      // Don't search if the input is empty
      setFoundUsers([]);
      setIsSearched(false);
      return;
    }

    const queryData = new URLSearchParams({
      text,
    });
    setIsLoading(true);
    setIsSearched(true);
    try {
      const response = await fetch(
        `/api/mixer/manager/user/findUserSearch?${queryData.toString()}`
      );
      if (!response.ok) {
        console.error("error finding users");
      }
      const result = await response.json();
      setFoundUsers(result.users);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFindUsers = useMemo(
    () =>
      debounce((text: string) => {
        findUsers(text);
      }, 300),
    [findUsers]
  );

  const handleSearchTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setSearchText(text);
      debouncedFindUsers(text);
    },
    [debouncedFindUsers]
  );

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsConnectButton(true);
  };

  const handleConnect = (user: User) => {
    onConnectUser(user);
    onCancel();
  };
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-30"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-bg2 p-3 rounded-lg shadow-lg text-white max-w-[17rem] w-full relative flex flex-col gap-2 outline"
        >
          <button className="absolute top-2 right-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl">User Finder</h2>
          <div className="flex justify-center items-center">
            <input
              type="text"
              className="bg-slate-900 rounded-l py-1 px-2 w- focus:outline-hidden"
              placeholder="User Search"
              value={searchText}
              onChange={handleSearchTextChange}
            />
            <button className="bg-bg0 rounded-r px-2 py-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>
          {isSearched && (
            <div>
              {isLoading ? (
                <div className="flex justify-center">
                  <ElementLoadingAnimation />
                </div>
              ) : (
                <div className="flex flex-col justify-center gap-2">
                  {foundUsers.map(user => (
                    <div key={user.id} className="">
                      <button
                        className={clsx(
                          "bg-slate-900 p-1 w-full rounded-sm",
                          user === selectedUser &&
                            "outline outline-blue-500  shadow-md shadow-blue-500"
                        )}
                        onClick={() => handleUserClick(user)}
                      >
                        {user.name}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {isConnectButton && selectedUser && (
            <div className="flex justify-end">
              <button
                className="bg-blue-500 px-2 py-1 rounded-sm"
                onClick={() => handleConnect(selectedUser)}
              >
                Connect
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
