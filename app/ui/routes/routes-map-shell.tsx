"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TopDown from "./topdown";
import type { WallPartKey } from "@/lib/wallLocations";
import { buildTopdownMapData } from "@/lib/topdown";

type RoutesMapShellProps = {
  onData: (data: WallPartKey | null) => void;
  initialSelection?: WallPartKey | null;
};

export default function RoutesMapShell({ onData, initialSelection = null }: RoutesMapShellProps) {
  const foundation = useQuery(api.map.getRoutesMapFoundation, {});

  if (foundation === undefined) {
    return (
      <div className="flex h-[290px] w-full items-center justify-center text-sm text-slate-300">
        Loading map...
      </div>
    );
  }

  if (foundation === null) {
    return (
      <div className="flex h-[290px] w-full items-center justify-center text-sm text-slate-300">
        Map unavailable.
      </div>
    );
  }

  const map = buildTopdownMapData(foundation.map, foundation.walls);

  return <TopDown map={map} onData={onData} initialSelection={initialSelection} />;
}
