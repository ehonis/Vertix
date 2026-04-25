"use client";
import { useState } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";
import clsx from "clsx";
import ImageUploaderPopUp from "./image-uploader-popup";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import ElementLoadingAnimation from "../../general/element-loading-animation";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/lib/appUser";
import SignOut from "../../general/sign-out-button";

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

export default function ProfileSettingsPane({ user }: { user: AppUser }) {
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
  const [profileVisibility, setProfileVisibility] = useState(user.private ? "true" : "false");

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
      privacy: profileVisibility === "true",
    };
    {
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
          setHasUserTyped(false);
          router.push(`/profile/${username}/settings`);
          router.refresh();
        }
      } catch (error) {
        showNotification({
          message: "Error saving profile settings",
          color: "red",
        });
      }
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
  const inputStateClass = clsx(
    !isUsernameAvailable && didUsernameChange && "border-red-500/80 ring-1 ring-red-500/40",
    isUsernameAvailable && didUsernameChange && "border-green-500/80 ring-1 ring-green-500/35"
  );

  return (
    <div className="flex flex-col gap-4 font-barlow text-white">
      {isImageUploaderOpen && (
        <ImageUploaderPopUp onCancel={() => setIsImageUploaderOpen(false)} user={user} />
      )}
      <div className="rounded-[28px] border border-white/8 bg-slate-900/90 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
          <button
            className="relative size-30 overflow-hidden rounded-full bg-bg2 ring-2 ring-white/10 transition hover:ring-white/25"
            onClick={() => setIsImageUploaderOpen(true)}
            aria-label="Change profile picture"
          >
            {user.image ? (
              <Image src={user.image} alt="profile" fill sizes="120px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/70">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>
            )}
          </button>

            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-white/45">Tap to change profile picture</p>
            </div>
          </div>

          <div className="h-px bg-white/6" />

          <div className="flex flex-col gap-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Profile</p>
            <div className="space-y-5 px-1">
              <div className="flex flex-col gap-3">
              <div className="mb-3 flex flex-col gap-1">
                <p className="text-sm font-semibold text-white/85">Name</p>
                <p className="text-xs text-white/50">This is what people see first on your profile.</p>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  onChange={handleNameChange}
                  value={name}
                  placeholder="Name"
                  className="w-full rounded-2xl border border-white/8 bg-bg2 px-4 py-3 text-base text-white placeholder:text-white/25 transition focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                {!isNameValid && <p className="text-sm text-red-400">{nameError}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="mb-3 flex flex-col gap-1">
                <p className="text-sm font-semibold text-white/85">Username</p>
                <p className="text-xs text-white/50">Short, clean, and easy to remember.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div
                  className={clsx(
                    "flex items-center gap-2 rounded-[20px] border border-white/8 bg-bg2 p-1.5 transition",
                    inputStateClass
                  )}
                >
                  <div className="flex h-11 min-w-11 items-center justify-center rounded-2xl bg-white px-3 text-base font-bold text-slate-950">
                    @
                  </div>
                  <input
                    type="text"
                    onChange={handleUsernameChange}
                    value={username}
                    placeholder="Username"
                    className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-white placeholder:text-white/30 focus:outline-none"
                  />
                  <div className="flex h-11 min-w-11 items-center justify-center text-white/70">
                    {isUsernameLoading ? (
                      <ElementLoadingAnimation size={5} />
                    ) : !isUsernameLoading && didUsernameChange && isUsernameAvailable ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-5 text-green-400"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : !isUsernameLoading && didUsernameChange && !isUsernameAvailable ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-5 text-red-400"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    ) : null}
                  </div>
                </div>
                {!isUsernameValid && <p className="text-sm text-red-400">{usernameError}</p>}
              </div>
            </div>
          </div>
        </div>

          <div className="h-px bg-white/6" />

          <div className="flex flex-col gap-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Climbing</p>
            <div className="px-1">
              <div className="flex flex-col gap-3">
              <div className="mb-3 flex flex-col gap-1">
                <p className="text-sm font-semibold text-white/85">Primary Discipline</p>
                <p className="text-xs text-white/50">Set the style that best describes how you climb.</p>
              </div>
              <div className="relative">
                <select
                  name=""
                  id=""
                  className="w-full appearance-none rounded-2xl border border-white/8 bg-bg2 px-4 py-3 pr-10 text-base text-white transition focus:outline-none focus:ring-2 focus:ring-white/20"
                  value={tag}
                  onChange={e => {
                    setTag(e.target.value);
                    if (e.target.value === user.tag) {
                      setHasUserTyped(false);
                    } else {
                      setHasUserTyped(true);
                    }
                  }}
                >
                  <option value="Rope Climber">Rope Climber</option>
                  <option value="Boulder">Boulder</option>
                  <option value="All Around">All Around</option>
                  <option value="none">none</option>
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-white/55"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

          <div className="h-px bg-white/6" />

          <div className="flex flex-col gap-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Privacy</p>
            <div className="px-1">
              <div className="flex flex-col gap-4">
              <div className="mb-4 flex flex-col gap-1">
                <p className="text-sm font-semibold text-white/85">Profile Visibility</p>
                <p className="text-xs text-white/50">
                  If your profile is private, you will not appear on the public leaderboard.
                </p>
              </div>
              <div className="rounded-2xl bg-bg2 p-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextValue = "false";
                      setProfileVisibility(nextValue);
                      if (nextValue === (user.private ? "true" : "false")) {
                        setHasUserTyped(false);
                      } else {
                        setHasUserTyped(true);
                      }
                    }}
                    className={clsx(
                      "rounded-xl px-3 py-3 text-sm font-semibold transition",
                      profileVisibility === "false"
                        ? "bg-white text-slate-950"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextValue = "true";
                      setProfileVisibility(nextValue);
                      if (nextValue === (user.private ? "true" : "false")) {
                        setHasUserTyped(false);
                      } else {
                        setHasUserTyped(true);
                      }
                    }}
                    className={clsx(
                      "rounded-xl px-3 py-3 text-sm font-semibold transition",
                      profileVisibility === "true"
                        ? "bg-white text-slate-950"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    Private
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div className="h-px bg-white/6" />

          <div className="flex flex-col gap-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Account</p>
            <div className="px-1">
              <div className="rounded-2xl border border-white/8 bg-bg2 p-4">
                <div className="mb-3 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-white/85">Session</p>
                  <p className="text-xs text-white/50">Leave this account on this device.</p>
                </div>
                <SignOut />
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasUserTyped && (
        <div className="fixed bottom-4 inset-x-0 z-20 flex justify-center px-4 pointer-events-none animate-fade-up">
          <div className="w-full max-w-md pointer-events-auto">
            <button
              className="w-full rounded-2xl bg-white py-3.5 font-bold text-slate-950 active:scale-[0.985] transition hover:bg-white/90 shadow-lg shadow-black/25"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
