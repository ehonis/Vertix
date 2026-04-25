"use client";

import { useState, useEffect } from "react";
import ProfileSettingsPane from "./profile-settings-pane";
import clsx from "clsx";
import Onboarding from "./onboarding";
import type { AppUser } from "@/lib/appUser";

export default function SettingsNavBar({ user }: { user: AppUser }) {
  const [activeTab, setActiveTab] = useState(
    user.isOnboarded ? "profile-settings" : "finish-onboarding"
  );

  useEffect(() => {
    if (user.isOnboarded) {
      setActiveTab("profile-settings");
    }
  }, [user.isOnboarded]);

  // Fully onboarded users skip the tab bar — no reason to show it.
  if (user.isOnboarded) {
    return (
      <div className="w-full">
        <ProfileSettingsPane user={user} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Segmented control */}
      <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl font-barlow">
        <button
          onClick={() => setActiveTab("finish-onboarding")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-white transition-colors",
            activeTab === "finish-onboarding"
              ? "bg-bg2 shadow-sm"
              : "text-white/60 hover:text-white"
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          Finish Onboarding
        </button>
        <button
          onClick={() => setActiveTab("profile-settings")}
          className={clsx(
            "flex-1 px-3 py-2 rounded-lg text-sm font-bold text-white transition-colors",
            activeTab === "profile-settings"
              ? "bg-bg2 shadow-sm"
              : "text-white/60 hover:text-white"
          )}
        >
          Profile Settings
        </button>
      </div>

      <div className="w-full">
        {activeTab === "finish-onboarding" && <Onboarding user={user} />}
        {activeTab === "profile-settings" && <ProfileSettingsPane user={user} />}
      </div>
    </div>
  );
}
