"use client";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { User } from "@/generated/prisma/browser";
import clsx from "clsx";
import ElementLoadingAnimation from "../../general/element-loading-animation";

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if the value changes before the delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function UserEditor() {
  const [isSearch, setIsSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [takeAmount, setTakeAmount] = useState(10);
  // Debounce the search text with a 300ms delay
  const debouncedSearchText = useDebounce(searchText, 300);

  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedSearchText === "") {
        setUsers([]);
        setHasMore(false);
        return;
      }

      setIsLoading(true);
      const queryData = new URLSearchParams({
        search: debouncedSearchText,
        take: takeAmount.toString(),
      });

      const response = await fetch("/api/user/manager/search?" + queryData);
      const data = await response.json();
      setUsers(data.data);
      setHasMore(data.hasMore);
      setIsLoading(false);
    };
    fetchUsers();
  }, [debouncedSearchText]); // Changed dependency to use debounced value

  const handleShowMore = async () => {
    if (!hasMore) return;
    setIsLoading(true);
    const queryData = new URLSearchParams({
      search: debouncedSearchText,
      take: (takeAmount + 10).toString(),
    });

    const response = await fetch("/api/user/manager/search?" + queryData);
    const data = await response.json();
    setUsers(data.data);
    setHasMore(data.hasMore);
    setIsLoading(false);
  };

  return (
    <div className={clsx("flex flex-col rounded-md py-2 w-xs md:w-lg h-full")}>
      <div
        className={clsx(
          "flex justify-between mb-1 gap-3 justify-self-center items-center",
          isSearch && "border-2 border-white"
        )}
      >
        <input
          type="text"
          className="py-1 border-b w-full focus:outline-none"
          placeholder="Search..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <button className="" onClick={() => setIsSearch(!isSearch)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-7 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {users.map(user => (
          <Link
            href={`/admin/manager/users/${user.id}`}
            className="flex flex-col w-full bg-slate-900 p-2 rounded-md"
            key={user.id}
          >
            <div className="flex gap-2 items-center">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={`picture of ${user.name}`}
                  width={100}
                  height={100}
                  className="rounded-full object-cover size-14"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-14 stroke-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
              <div className="flex flex-col">
                <p className="text-lg font-bold truncate w-40">{user.name || "No name"}</p>
                <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                <p
                  className={clsx(
                    "text-xs  truncate",
                    user.role === "ADMIN" && "text-blue-500",
                    user.role === "USER" && "text-gray-400"
                  )}
                >
                  {user.role}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {hasMore && (
          <button className="text-white p-2 rounded-md bg-blue-500" onClick={handleShowMore}>
            Show more
          </button>
        )}
      </div>
      {isLoading && (
        <div className="flex justify-center items-center">
          <ElementLoadingAnimation />
        </div>
      )}
    </div>
  );
}
