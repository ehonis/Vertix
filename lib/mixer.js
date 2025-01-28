export function getPoints(mixerRoutes, routeId, holdNumber, type) {
  // Find the route by its ID
  const route = mixerRoutes.find((r) => r.id === routeId);
  if (!route) {
    return null;
  }

  // Find the hold by its holdNumber
  const hold = route.holds.find((h) => h.holdNumber === holdNumber);
  if (!hold) {
    return null;
  }

  // Access the points by the specified type (topRopePoints or leadPoints)
  if (!hold.hasOwnProperty(type)) {
    return null;
  }

  return hold[type];
}
