"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  createdAt: string;
};

type AnnouncementContextType = {
  announcement: Announcement | null;
  isVisible: boolean;
  dismissAnnouncement: () => void;
};

const AnnouncementContext = createContext<AnnouncementContextType>({
  announcement: null,
  isVisible: false,
  dismissAnnouncement: () => {},
});

export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Check for announcements on mount
  useEffect(() => {
    checkForAnnouncements();
  }, []);

  const checkForAnnouncements = async () => {
    console.log("🔍 Checking for announcements...");
    try {
      const response = await fetch("/api/announcements/current");

      if (response.ok) {
        const data = await response.json();
        console.log("📋 API response data:", data);

        if (data.announcement) {
          console.log("✅ Found announcement:", data.announcement);
          setAnnouncement(data.announcement);
          setIsVisible(true);
        } else {
          console.log("❌ No announcement found");
        }
      } else {
        console.log("❌ API request failed:", response.status);
      }
    } catch (error) {
      console.error("💥 Failed to check announcements:", error);
    }
  };

  const dismissAnnouncement = async () => {
    if (!announcement) return;

    setIsVisible(false);

    try {
      await fetch("/api/announcements/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: announcement.id }),
      });
    } catch (error) {
      console.error("Failed to dismiss announcement:", error);
    }

    // Clear announcement after animation
    setTimeout(() => {
      setAnnouncement(null);
    }, 300);
  };

  return (
    <AnnouncementContext.Provider
      value={{
        announcement,
        isVisible,
        dismissAnnouncement,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

export const useAnnouncement = () => useContext(AnnouncementContext);
