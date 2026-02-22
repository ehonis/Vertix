"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import ConfirmationPopUp from "@/app/ui/general/confirmation-pop-up";
import { User, UserRole } from "@/generated/prisma/browser";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function IndividualUserEdit({ user }: { user: User }) {
  const { showNotification } = useNotification();
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [image, setImage] = useState(user.image || "");
  const [isPopConfirmationUp, setIsPopConfirmationUp] = useState(false);
  const [role, setRole] = useState(user.role || UserRole.USER);
  const [isRoleChange, setIsRoleChange] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [UsernameError, setUsernameError] = useState<string>("");
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameError, setNameError] = useState<string>("");
  const [hasNameTyped, setHasNameTyped] = useState(false);

  const checkUsername = useCallback(async () => {
    if (username.length > 0 && hasUserTyped && username !== user.username) {
      try {
        const response = await fetch(
          `/api/user/settings/userNameCheck?username=${encodeURIComponent(username)}`
        );
        const data = await response.json();
        setIsUsernameAvailable(data.available);
      } catch (error) {
        console.error("Error checking username:", error);
      }
    }
  }, [username, hasUserTyped, user.username]);

  const debouncedCheckUsername = useCallback(() => {
    const timeoutId = setTimeout(checkUsername, 1000);
    return () => clearTimeout(timeoutId);
  }, [checkUsername]);

  useEffect(() => {
    if (username.length < 3 || username.length > 16) {
      setIsUsernameValid(false);
      setUsernameError("Username must be between 3 and 16 characters");
    } else if (username.includes(" ")) {
      setIsUsernameValid(false);
      setUsernameError("Username cannot contain spaces");
    } else if (/[^a-zA-Z0-9]/.test(username)) {
      setIsUsernameValid(false);
      setUsernameError("Username can only contain letters and numbers");
    } else {
      setIsUsernameValid(true);
      setUsernameError("");
      if (username.length > 0 && hasUserTyped && username !== user.username) {
        const cleanup = debouncedCheckUsername();
        return cleanup;
      } else {
        setHasUserTyped(false);
      }
    }
  }, [username, debouncedCheckUsername]);

  const router = useRouter();
  const handleDeleteUser = async () => {
    try {
      const response = await fetch("/api/user/manager/delete-user", {
        method: "POST",
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        showNotification({ message: "User deleted successfully", color: "green" });
        router.push("/admin/manager/users");
      }
    } catch (error) {
      console.error(error);
      showNotification({ message: "Error deleting user", color: "red" });
      router.refresh();
    }
  };
  const handleRemoveImage = async () => {
    try {
      const response = await fetch("/api/user/manager/delete-image", {
        method: "POST",
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        showNotification({ message: "Image deleted successfully", color: "green" });
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      showNotification({ message: "Error deleting image", color: "red" });
      router.refresh();
    }
  };
  const sumbitRoleChange = async () => {
    try {
      const response = await fetch("/api/user/manager/change-role", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, role: role }),
      });
      if (response.ok) {
        showNotification({ message: "Role changed successfully", color: "green" });
        setIsRoleChange(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      showNotification({ message: "Error changing role", color: "red" });
    }
  };
  const handleChangeRole = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value !== user.role) {
      setIsRoleChange(true);
      setRole(e.target.value as UserRole);
    } else {
      setIsRoleChange(false);
    }
  };
  const handleUsernameSubmit = async () => {
    try {
      const response = await fetch("/api/user/manager/change-username", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, username: username }),
      });
      if (response.ok) {
        showNotification({ message: "Username changed successfully", color: "green" });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      showNotification({ message: "Error changing username", color: "red" });
    }
  };
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setHasUserTyped(true);
  };
  const handleNameSubmit = async () => {
    try {
      const response = await fetch("/api/user/manager/change-name", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, name: name }),
      });
      if (response.ok) {
        showNotification({ message: "Name changed successfully", color: "green" });
        setHasNameTyped(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      showNotification({ message: "Error changing name", color: "red" });
    }
  };
  useEffect(() => {
    setRole(user.role);
    setUsername(user.username || "");
    setName(user.name || "");
    setImage(user.image || "");
  }, [user]);

  useEffect(() => {
    if (name.length < 3 || name.length > 50) {
      setIsNameValid(false);
      setNameError("Username must be between 3 and 50 characters");
    } else if (name === user.name) {
      setHasNameTyped(false);
    } else {
      setIsNameValid(true);
      setNameError("");
    }
  }, [name]);

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
          <div className="flex flex-col w-xs md:w-lg bg-slate-900 rounded-md p-3 gap-3">
            {/* name */}
            <div className="flex flex-col gap-1 w-full">
              <label className="font-bold text-lg">Name</label>
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  value={name}
                  className="focus:outline-none p-2 bg-bg2 rounded  w-full"
                  onChange={e => {
                    setName(e.target.value);
                    setHasNameTyped(true);
                  }}
                />
                {isNameValid && hasNameTyped && (
                  <button
                    className="bg-green-500 text-white p-2 rounded w-min"
                    onClick={handleNameSubmit}
                  >
                    Submit
                  </button>
                )}
              </div>
              {!isNameValid && hasNameTyped && <p className="text-sm text-red-500">{nameError}</p>}
            </div>

            {/* username */}
            <div className="flex flex-col gap-1 ">
              <label className="font-bold text-lg">Username</label>
              <div className="flex gap-2 w-full">
                <div
                  className={clsx(
                    "flex rounded-md w-full",
                    isUsernameAvailable &&
                      hasUserTyped &&
                      isUsernameValid &&
                      "outline outline-green-500",
                    !isUsernameAvailable &&
                      hasUserTyped &&
                      isUsernameValid &&
                      "outline outline-red-500"
                  )}
                >
                  <p className="p-2 text-lg rounded-l bg-blue-500 font-semibold">@</p>
                  <input
                    type="text"
                    value={username}
                    className="focus:outline-none p-2 bg-bg2 rounded-r w-full"
                    onChange={handleUsernameChange}
                  />
                </div>
                {hasUserTyped && isUsernameAvailable && isUsernameValid && (
                  <button
                    className="bg-green-500 text-white p-2 rounded w-min"
                    onClick={handleUsernameSubmit}
                  >
                    Submit
                  </button>
                )}
              </div>
              {hasUserTyped && isUsernameValid ? (
                isUsernameAvailable ? (
                  <p className="text-green-500 text-sm">Username is available</p>
                ) : (
                  <p className="text-red-500 text-sm">Username is already taken</p>
                )
              ) : null}
              {!isUsernameValid && <p className="text-red-500 text-sm">{UsernameError}</p>}
            </div>

            {/* role */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-lg">Role</label>
              <div className="flex w-full gap-1 justify-between">
                <select
                  name="role"
                  id="role"
                  value={role}
                  className="focus:outline-none p-2 bg-bg2 rounded"
                  onChange={handleChangeRole}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="ROUTE_SETTER">Route Setter</option>
                  <option value="USER">User</option>
                </select>
                {isRoleChange && (
                  <button
                    className="bg-green-500 text-white p-2 rounded w-min"
                    onClick={() => sumbitRoleChange()}
                  >
                    Submit
                  </button>
                )}
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
                  <button
                    className="bg-red-500 text-xs rounded px-3 py-1 w-auto"
                    onClick={() => handleRemoveImage()}
                  >
                    Remove
                  </button>
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
