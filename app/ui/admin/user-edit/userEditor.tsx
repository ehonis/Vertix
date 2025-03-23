"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

type UserEditorProps = {
  users: {
    id: string | null;
    name: string | null;
    username: string | null;
    image: string | null;
  }[];
};

export default function UserEditor({ users }: UserEditorProps) {
  const [isSearch, setIsSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  return (
    <div className="flex flex-col   bg-bg0 rounded-md px-5 py-2 w-xs md:w-lg">
      <div className="flex justify-between mb-1">
        <button className="bg-gray-400 rounded px-3 py-1  text-sm ">Select</button>
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
      <div className="h-1 w-full bg-white rounded-md mb-1" />
      <div className="flex flex-col gap-2 mt-2">
        {users.map(user => (
          <Link
            href={`/admin/manager/users/${user.id}`}
            className="flex flex-col w-full bg-black p-2 rounded-md"
            key={user.id}
          >
            <div className="flex gap-2">
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
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
