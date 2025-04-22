import { getRouteById } from "@/lib/route";
import EditRoute from "./edit-route";
import { getRouteImagesById } from "@/lib/routes";
import { findDaysOld } from "@/lib/dates";
import { findAllTotalSends } from "@/lib/routes";
import { findStarRating } from "@/lib/route";
export default async function IndividualRoutePageLoad({ routeId }: { routeId: string }) {
  const route = await getRouteById(routeId);
  if (!route) {
    return <div>Route not found with id:{routeId}</div>;
  }
  const images = await getRouteImagesById(routeId);
  const daysOld = findDaysOld(route?.setDate);
  const totalSends = await findAllTotalSends(route.id);
  const starRating = await findStarRating(route.id);

  return (
    <EditRoute
      route={route}
      images={images}
      daysOld={daysOld}
      totalSends={totalSends}
      starRating={starRating}
    />
  );
}
