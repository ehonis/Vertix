import { getRouteById } from "@/lib/routes";
import EditRoute from "./edit-route";
import { getRouteImagesById } from "@/lib/routes";
import { findDaysOld } from "@/lib/dates";
import { findAllTotalSends } from "@/lib/routes";
export default async function IndividualRoutePageLoad({ routeId }) {
  const route = await getRouteById(routeId);
  const images = await getRouteImagesById(routeId);
  const daysOld = findDaysOld(route.setDate);
  const totalSends = await findAllTotalSends(route.id);

  return <EditRoute route={route} images={images} daysOld={daysOld} totalSends={totalSends} />;
}
