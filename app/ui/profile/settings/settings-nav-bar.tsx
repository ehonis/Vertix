"use client";

import { useState, useEffect } from "react";
import ProfileSettingsPane from "./profile-settings-pane";
import clsx from "clsx";
import Onboarding from "./onboarding";
import { User } from "@prisma/client";
export default function SettingsNavBar({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState(
    user.isOnboarded ? "profile-settings" : "finish-onboarding"
  );

  useEffect(() => {
    if (user.isOnboarded) {
      setActiveTab("profile-settings");
    }
  }, [user.isOnboarded]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex gap-2 items-center justify-self-start justify-between w-xs md:w-md md:max-w-md">
        <div className="flex items-center">
          {!user.isOnboarded && (
            <button
              onClick={() => setActiveTab("finish-onboarding")}
              className={clsx(
                "font-barlow font-bold text-white rounded-t-md p-2 text-sm flex gap-2 items-center",
                activeTab === "finish-onboarding" && "bg-slate-900 p-2 rounded-t-md"
              )}
            >
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <p className="md:text-lg">Finish Onboarding</p>
            </button>
          )}
          <button
            onClick={() => setActiveTab("profile-settings")}
            className={clsx(
              "font-barlow font-bold text-white text-sm p-2 rounded-t-md",
              activeTab === "profile-settings" && "bg-slate-900 p-2 rounded-t-md"
            )}
          >
            <p className="md:text-lg">Profile Settings</p>
          </button>
        </div>
        <div className="flex justify-end"></div>
      </div>
      <div className="flex flex-col gap-2 max-w-xs md:max-w-md">
        {activeTab === "finish-onboarding" && <Onboarding user={user} />}
        {activeTab === "profile-settings" && <ProfileSettingsPane user={user} />}
      </div>
    </div>
  );
}
