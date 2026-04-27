"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { buildTopdownMapData } from "@/lib/topdown";
import RouteDotManager from "./RouteDotManager";

export default function RouteManagerShell() {
  const foundation = useQuery(api.map.getRoutesMapFoundation, {});
  const routes = useQuery(api.routes.getRouteManagerRoutes, {});

  if (foundation === undefined || routes === undefined) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#09090B]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
          <p className="text-xs text-zinc-500">Loading routes...</p>
        </div>
      </div>
    );
  }

  if (foundation === null) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#09090B]">
        <p className="text-sm text-zinc-400">Map unavailable. Set up a gym area map first.</p>
      </div>
    );
  }

  const map = buildTopdownMapData(foundation.map, foundation.walls);

  return <RouteDotManager map={map} routes={routes} />;
}
