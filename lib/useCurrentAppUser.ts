"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type AppUser = {
  id: string;
  clerkId: string | null;
  email: string;
  name: string | null;
  username: string | null;
  image: string | null;
  phoneNumber: string | null;
  role: string;
  highestRopeGrade: string | null;
  highestBoulderGrade: string | null;
  totalXp: number;
  isOnboarded: boolean;
  private: boolean;
  createdAt: string;
  updatedAt: string;
};

export function useCurrentAppUser() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setUser(null);
      setIsFetching(false);
      return;
    }

    let isCancelled = false;

    async function loadUser() {
      setIsFetching(true);

      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "same-origin",
        });

        if (!response.ok) {
          if (!isCancelled) {
            setUser(null);
          }
          return;
        }

        const data = (await response.json()) as { user: AppUser | null };

        if (!isCancelled) {
          setUser(data.user);
        }
      } catch {
        if (!isCancelled) {
          setUser(null);
        }
      } finally {
        if (!isCancelled) {
          setIsFetching(false);
        }
      }
    }

    loadUser();

    return () => {
      isCancelled = true;
    };
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  return {
    user,
    isLoaded,
    isSignedIn,
    isLoading: !isLoaded || (isSignedIn && isFetching),
  };
}
