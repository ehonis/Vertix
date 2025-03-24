"use client";
import { useState } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";
import clsx from "clsx";
import ImageUploaderPopUp from "./image-uploader-popup";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import ElementLoadingAnimation from "../../general/element-loading-animation";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

// A debounce function that returns a cancel function for cleanup.
const debounce = (
  func: (username: string, hasUserTyped: boolean, userDataUsername: string) => void,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout;
  const debouncedFunction = (username: string, hasUserTyped: boolean, userDataUsername: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(username, hasUserTyped, userDataUsername);
    }, delay);
  };
  debouncedFunction.cancel = () => clearTimeout(timeoutId);
  return debouncedFunction;
};

export default function ProfileSettingsPane({ user }: { user: User }) {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [name, setName] = useState<string>(user.name ?? "");
  const [username, setUsername] = useState<string>(user.username ?? "");
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [didUsernameChange, setDidUsernameChange] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [usernameError, setUsernameError] = useState("");
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameError, setNameError] = useState("");
  const [tag, setTag] = useState<string>(user.tag ?? "none");

  const checkUsername = useCallback(async () => {
    if (username.length > 0 && hasUserTyped && username !== user.username) {
      try {
        const response = await fetch(
          `/api/user/settings/userNameCheck?username=${encodeURIComponent(username)}`
        );
        const data = await response.json();
        setIsUsernameAvailable(data.available);
        if (data.available) {
          setUsernameError("");
          setIsUsernameValid(true);
        } else {
          setUsernameError("Username is already taken");
          setIsUsernameValid(false);
        }
        setIsUsernameLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error checking username:", error.message);
        } else {
          console.error("Error checking username:", error);
        }
        setIsUsernameLoading(false);
      }
    } else if (username === user.username) {
      setIsUsernameAvailable(true);
      setIsUsernameValid(true);
      setUsernameError("");
      setIsUsernameLoading(false);
    }
  }, [username, hasUserTyped, user.username]);

  const debouncedCheckUsername = useCallback(() => {
    const debouncedFn = debounce(
      (username: string, hasUserTyped: boolean, userDataUsername: string) => {
        if (username.length > 0 && hasUserTyped && username !== userDataUsername) {
          checkUsername();
        }
      },
      1000
    );
    return debouncedFn;
  }, [checkUsername]);

  const handleSave = async () => {
    const data = {
      id: user.id,
      name,
      username,
      tag,
    };
    if (
      isNameValid &&
      isUsernameValid &&
      (tag !== user.tag || username !== user.username || name !== user.name)
    ) {
      try {
        const response = await fetch("/api/user/settings/uploadOnboarding", {
          method: "POST",
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          showNotification({
            message: "Error saving profile settings",
            color: "red",
          });
        } else {
          showNotification({
            message: "Profile settings saved",
            color: "green",
          });
          router.push(`/profile/${username}/settings`);
          router.refresh();
        }
      } catch (error) {
        showNotification({
          message: "Error saving profile settings",
          color: "red",
        });
      }
    } else {
      showNotification({
        message: "Please fix all errors",
        color: "red",
      });
    }
  };
  useEffect(() => {
    if (hasUserTyped) {
      setIsUsernameLoading(false);
      if (username === user.username) {
        setDidUsernameChange(false);
      } else {
        setDidUsernameChange(true);
        if (isUsernameValid) {
          setIsUsernameLoading(true);
          const currentUsername = user.username ?? "";
          debouncedCheckUsername()(username, hasUserTyped, currentUsername);
        }
      }
    }

    return () => {
      debouncedCheckUsername().cancel();
    };
  }, [username, debouncedCheckUsername, hasUserTyped, isUsernameValid, user.username]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasUserTyped(true);
    setUsername(e.target.value);

    if (e.target.value.length < 3 || e.target.value.length > 16) {
      setIsUsernameValid(false);
      setUsernameError("Username must be between 3 and 16 characters");
    } else if (e.target.value.includes(" ")) {
      setIsUsernameValid(false);
      setUsernameError("Username cannot contain spaces");
    } else if (/[^a-zA-Z0-9]/.test(e.target.value)) {
      setIsUsernameValid(false);
      setUsernameError("Username can only contain letters and numbers");
    } else if (e.target.value === user.username) {
      setIsUsernameValid(true);
      setUsernameError("");
      setIsUsernameAvailable(true);
    } else {
      setIsUsernameValid(true);
      setUsernameError("");
    }
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasUserTyped(true);
    setName(e.target.value);
    if (e.target.value.length < 0 || e.target.value.length > 50) {
      setIsNameValid(false);
      setNameError("Name must be between 1 and 16 characters");
    } else if (/[^a-zA-Z0-9\s]/.test(e.target.value)) {
      setIsNameValid(false);
      setNameError("Name can only contain letters, numbers and spaces");
    } else {
      setIsNameValid(true);
      setNameError("");
    }
  };

  return (
    <div className=" bg-bg1 p-5 w-xs md:w-md rounded-lg flex-col flex gap-3 font-barlow text-white rounded-tl-none">
      {isImageUploaderOpen && (
        <ImageUploaderPopUp onCancel={() => setIsImageUploaderOpen(false)} userId={user.id} />
      )}
      <div className="flex flex-col">
        <p className="text-lg font-bold">Profile Picture</p>
        <button
          className="flex items-center gap-2 bg-bg2 rounded-md p-2"
          onClick={() => setIsImageUploaderOpen(true)}
        >
          {user.image ? (
            <Image
              src={user.image}
              alt="profile"
              width={100}
              height={100}
              className="rounded-full size-20"
            />
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
          <div className="flex items-center gap-1">
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
                d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18"
              />
            </svg>
            <p className="text-xs">Tap to change profile picture</p>
          </div>
        </button>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold">Name</p>
          <input
            type="text"
            onChange={handleNameChange}
            value={name}
            placeholder="Name"
            className="bg-bg2 rounded-md p-2 w-full text-lg  focus:outline-none"
          />
          {!isNameValid && <p className="text-red-500 text-sm">{nameError}</p>}
        </div>
        <p className="text-lg font-bold">Username</p>
        <div className="flex items-center gap-1 w-full">
          <div
            className={clsx(
              "flex items-center rounded-md w-full",
              !isUsernameAvailable && didUsernameChange && "outline outline-red-500",
              isUsernameAvailable && didUsernameChange && "outline outline-green-500"
            )}
          >
            <p
              className={clsx(
                "bg-blue-500 font-barlow text-white p-2 text-lg font-bold rounded-l-md "
              )}
            >
              @
            </p>
            <input
              type="text"
              onChange={handleUsernameChange}
              value={username}
              placeholder="Username"
              className="bg-bg2 rounded-r-md p-2 text-lg w-full focus:outline-none"
            />
          </div>
          {isUsernameLoading ? (
            <div className="flex items-center justify-center">
              <ElementLoadingAnimation size={5} />
            </div>
          ) : null}
        </div>
        {!isUsernameValid && <p className="text-red-500 text-sm">{usernameError}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-bold">Tag</p>
        <select
          name=""
          id=""
          className="bg-bg2 rounded-md p-2 text-lg"
          value={tag}
          onChange={e => {
            setTag(e.target.value);
            setHasUserTyped(true);
          }}
        >
          <option value="Rope Climber">Rope Climber</option>
          <option value="Boulder">Boulder</option>
          <option value="All Around">All Around</option>
          <option value="none">none</option>
        </select>
      </div>
      {hasUserTyped && (
        <button className="bg-green-500 text-white p-2 rounded-md font-bold" onClick={handleSave}>
          Save Changes
        </button>
      )}
    </div>
  );
}
