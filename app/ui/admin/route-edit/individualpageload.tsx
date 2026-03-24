import { getRouteById } from "@/lib/route";
import EditRoute from "./edit-route";
import { getRouteImagesById } from "@/lib/routes";
import { findDaysOld } from "@/lib/dates";
import { findAllTotalSends } from "@/lib/routes";
import { findStarRating } from "@/lib/route";
import { toWallPartKey } from "@/lib/wallLocations";
export default async function IndividualRoutePageLoad({ routeId }: { routeId: string }) {
  const route = await getRouteById(routeId);
  if (!route) {
    return <div>Route not found with id:{routeId}</div>;
  }
  const images = await getRouteImagesById(routeId);
  const daysOld = findDaysOld(route?.setDate);
  const totalSends = await findAllTotalSends(route.id);
  const starRating = await findStarRating(route.id);

  const routeForEditor = {
    ...route,
    setDate: new Date(route.setDate),
    type: route.type,
    isArchive: route.isArchive,
    order: route.order,
    location: toWallPartKey(route.location) ?? "boulderSouth",
    createdByUserID: null,
  };

  return (
    <EditRoute
      route={routeForEditor as any}
      images={images}
      daysOld={daysOld}
      totalSends={totalSends}
      starRating={starRating}
    />
  );
}
