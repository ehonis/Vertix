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
export function getTopScores(completions, points) {
  const trueIds = Object.entries(completions)
    .filter(([key, value]) => value === true)
    .map(([key]) => Number(key));

  const filteredPoints = trueIds.reduce((acc, id) => {
    acc[id] = points[id];
    return acc;
  }, {});

  const topScores =
    Object.keys(filteredPoints).length > 2
      ? Object.entries(filteredPoints)
          .sort((a, b) => b[1] - a[1]) // Sort by points in descending order
          .slice(0, 2) // Get the top two entries
      : Object.entries(filteredPoints);

  return topScores;
}
export function getPointPrediction(mixerRoutes, topScores, routeId) {
  const route = mixerRoutes.find((r) => r.id === routeId);

  const results = topScores.map(([id, score]) => {
    const topRopetoBeat = route.holds.find((h) => h.topRopePoints > score);
    const leadToBeat = route.holds.find((h) => h.leadPoints > score);

    return {
      id,
      topRopetoBeat: topRopetoBeat
        ? {
            hold: topRopetoBeat.holdNumber,
            topRopePts: topRopetoBeat.topRopePoints,
          }
        : null,
      leadToBeat: leadToBeat
        ? { hold: leadToBeat.holdNumber, leadPts: leadToBeat.leadPoints }
        : null,
    };
  });

  return results;
}
export function getRouteNameById(mixerRoutes, routeId) {
  const route = mixerRoutes.find((r) => r.id === routeId);
  if (!route) {
    return null;
  }
  return route.routeName;
}
