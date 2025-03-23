"use client";
import Image from "next/image";
import { useState } from "react";
import ConfirmationPopUp from "@/app/ui/general/confirmation-pop-up";
import { User } from "@prisma/client";
import { useNotification } from "@/app/contexts/NotificationContext";

export default function IndividualUserEdit({ user }: { user: User }) {
  const { showNotification } = useNotification();
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [image, setImage] = useState(user.image || "");
  const [isPopConfirmationUp, setIsPopConfirmationUp] = useState(false);

  const handleDeleteUser = async () => {
    try {
      const response = await fetch("/api/user/manager/delete-user", {
        method: "POST",
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        showNotification({ message: "User deleted successfully", color: "green" });
      }
    } catch (error) {
      console.error(error);
      showNotification({ message: "Error deleting user", color: "red" });
    }
  };
  return (
    <>
      {isPopConfirmationUp && (
        <ConfirmationPopUp
          message="Are you sure you want to delete this user?"
          onConfirmation={() => handleDeleteUser()}
          onCancel={() => {
            setIsPopConfirmationUp(false);
          }}
          submessage="🚧 This will delete the user and all of their data 🚧"
        />
      )}
      <div className="text-white font-barlow flex flex-col w-full items-center py-5">
        <div className="flex flex-col items-center w-xs md:w-lg ">
          <div className="flex justify-between w-full mb-2">
            <h1 className="text-2xl font-bold ">User Details</h1>
            <button
              className="bg-red-500 px-2 py-1 text-lg rounded"
              onClick={() => setIsPopConfirmationUp(true)}
            >
              Delete User
            </button>
          </div>
          <div className="flex flex-col w-xs md:w-lg bg-bg1 rounded-md p-3 gap-3">
            {/* name */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-lg">Name</label>
              <input type="text" value={name} className="focus:outline-none p-2 bg-bg2 rounded" />
            </div>
            {/* username */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-lg">Username</label>
              <div className="flex">
                <p className="p-2 text-lg rounded-l bg-blue-500 font-semibold">@</p>
                <input
                  type="text"
                  value={username}
                  className="focus:outline-none p-2 bg-bg2 rounded-r w-full"
                />
              </div>
            </div>
            {/* email */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-lg">Email</label>
              <p>{user.email}</p>
            </div>
            {/* id */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-lg">ID</label>
              <p>{user.id}</p>
            </div>
            {/* image */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-lg">Image</label>
              {image ? (
                <div className="flex flex-col gap-1 w-20">
                  <Image
                    src={image}
                    alt="User Image"
                    width={100}
                    height={100}
                    className="rounded-full object-cover size-20"
                  />
                  <button className="bg-red-500 text-xs rounded px-3 py-1 w-auto">Remove</button>
                </div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
