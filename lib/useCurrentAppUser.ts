"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCurrentAppUser() {
  const { isLoaded, isSignedIn } = useAuth();
  const upsertCurrent = useMutation(api.users.upsertCurrent);
  const user = useQuery(api.users.getCurrent, isSignedIn ? {} : "skip");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    void upsertCurrent({});
  }, [isLoaded, isSignedIn, upsertCurrent]);

  return {
    user: user ?? null,
    isLoaded,
    isSignedIn,
    isLoading: !isLoaded || (isSignedIn && user === undefined),
  };
}
