"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { buildTopdownMapData } from "@/lib/topdown";
import RouteDotMap, { type RouteDot } from "./route-dot-map";
import { useMemo } from "react";

type Props = {
  selectedId: string | null;
  onSelectDot: (id: string | null) => void;
};

export default function RoutesDotMapShell({ selectedId, onSelectDot }: Props) {
  const foundation = useQuery(api.map.getRoutesMapFoundation, {});
  const routeDots = useQuery(api.routes.getRoutesPageDots, {});

  const map = useMemo(() => {
    if (!foundation) return null;
    return buildTopdownMapData(foundation.map, foundation.walls);
  }, [foundation]);

  const dots: RouteDot[] = useMemo(() => {
    if (!routeDots) return [];
    return routeDots.map(r => ({
      id: r.id,
      color: r.color,
      title: r.title,
      grade: r.grade,
      x: r.x,
      y: r.y,
      completionCount: r.completionCount,
    }));
  }, [routeDots]);

  if (foundation === undefined || routeDots === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
          <p className="text-xs text-zinc-500">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!map) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-zinc-400">Map unavailable.</p>
      </div>
    );
  }

  return (
    <RouteDotMap
      map={map}
      dots={dots}
      selectedId={selectedId}
      onSelectDot={onSelectDot}
    />
  );
}
