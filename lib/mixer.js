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

function rankScores(scores) {
  scores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score; // Sort by score (descending)
    }
    return a.attempts - b.attempts; // Tie-breaker: Fewer attempts (ascending)
  });

  let rank = 1;
  let previousScore = null;
  let previousAttempts = null;

  return scores.map((climber, index) => {
    // If the score and attempts are the same as the previous climber, they get the same rank
    if (
      climber.score === previousScore &&
      climber.attempts === previousAttempts
    ) {
      return { ...climber, rank };
    }

    // Otherwise, they get the new rank (index + 1)
    rank = index + 1;
    previousScore = climber.score;
    previousAttempts = climber.attempts;

    return { ...climber, rank };
  });
}

function combineScores(boulderRanked, ropeRanked) {
  const combined = boulderRanked.map((boulder) => {
    const rope = ropeRanked.find((r) => r.name === boulder.name);
    return {
      name: boulder.name,
      boulderRank: boulder.rank,
      ropeRank: rope ? rope.rank : Infinity,
      combinedRank: boulder.rank + (rope ? rope.rank : Infinity),
    };
  });

  return combined.sort((a, b) => {
    if (a.combinedRank !== b.combinedRank) {
      return a.combinedRank - b.combinedRank; // Sort by total combined rank first
    }
    // If combined ranks are tied, sort by the best (lowest) individual rank
    const bestRankA = Math.min(a.boulderRank, a.ropeRank);
    const bestRankB = Math.min(b.boulderRank, b.ropeRank);

    if (bestRankA !== bestRankB) {
      return bestRankA - bestRankB;
    }
    // If still tied, sort by boulder rank, then by rope rank
    return a.boulderRank - b.boulderRank || a.ropeRank - b.ropeRank;
  });
}

function rankByDivision(combinedScores, divisions) {
  let divisionResults = {};
  let totalCombinedRanks = 0;
  let totalClimbers = 0;

  // Loop through each division and process rankings
  Object.entries(divisions).forEach(([divisionName, climbers]) => {
    // Filter only climbers in this division
    let divisionClimbers = combinedScores.filter((climber) =>
      climbers.some((c) => c.name === climber.name)
    );

    // Sort by combined rank (lower is better)
    divisionClimbers.sort((a, b) => a.combinedRank - b.combinedRank);

    // Assign overall places
    divisionClimbers = divisionClimbers.map((climber, index) => ({
      ...climber,
      overallPlace: index + 1,
    }));

    // Calculate average combined rank for this division
    const divisionTotal = divisionClimbers.reduce(
      (sum, climber) => sum + climber.combinedRank,
      0
    );
    const divisionAverage =
      divisionClimbers.length > 0 ? divisionTotal / divisionClimbers.length : 0;

    // Store results
    divisionResults[divisionName] = {
      rankings: divisionClimbers,
      averageCombinedRank: Math.round(divisionAverage),
    };

    // Add to total combined rank for overall average
    totalCombinedRanks += divisionTotal;
    totalClimbers += divisionClimbers.length;
  });

  // Calculate overall average across all divisions
  const overallAverageCombinedRank =
    totalClimbers > 0 ? totalCombinedRanks / totalClimbers : 0;

  return { divisionResults, overallAverageCombinedRank };
}

function adjustDivisions(divisionRankings) {
  const { divisionResults } = divisionRankings;
  // Assume divisionResults keys are in order from easiest to hardest.
  const divisionNames = Object.keys(divisionResults);
  // Make a deep copy so we can modify without affecting the original object.
  const updatedDivisions = JSON.parse(JSON.stringify(divisionResults));
  const movedClimbers = [];

  // Iterate through each division.
  for (let i = 0; i < divisionNames.length; i++) {
    const currentDivision = divisionNames[i];
    const currentData = updatedDivisions[currentDivision];
    if (!currentData) continue;

    // --- Check for upward movement (to a harder division) ---
    // Only check if there is a next (harder) division.
    if (i < divisionNames.length - 1) {
      const nextDivision = divisionNames[i + 1];
      const nextAvg = updatedDivisions[nextDivision].averageCombinedRank;
      // A climber qualifies to move up if their combined rank is lower than the next division’s average.
      const moveUpClimbers = currentData.rankings.filter(
        (climber) => climber.combinedRank < nextAvg
      );
      // Remove these climbers from the current division.
      currentData.rankings = currentData.rankings.filter(
        (climber) => !moveUpClimbers.includes(climber)
      );
      // Add them to the next division.
      updatedDivisions[nextDivision].rankings.push(...moveUpClimbers);
      moveUpClimbers.forEach((climber) => {
        movedClimbers.push({
          name: climber.name,
          from: currentDivision,
          to: nextDivision,
        });
      });
    }

    // --- Check for downward movement (to an easier division) ---
    // Only check if there is a previous (easier) division.
    if (i > 0) {
      const previousDivision = divisionNames[i - 1];
      const prevAvg = updatedDivisions[previousDivision].averageCombinedRank;
      // A climber qualifies to move down if their combined rank is higher than the previous division’s average.
      const moveDownClimbers = currentData.rankings.filter(
        (climber) => climber.combinedRank > prevAvg
      );
      // Remove these climbers from the current division.
      currentData.rankings = currentData.rankings.filter(
        (climber) => !moveDownClimbers.includes(climber)
      );
      // Add them to the previous division.
      updatedDivisions[previousDivision].rankings.push(...moveDownClimbers);
      moveDownClimbers.forEach((climber) => {
        movedClimbers.push({
          name: climber.name,
          from: currentDivision,
          to: previousDivision,
        });
      });
    }
  }

  // Finally, re-sort each division by combinedRank.
  for (let division in updatedDivisions) {
    updatedDivisions[division].rankings.sort(
      (a, b) => a.combinedRank - b.combinedRank
    );
  }

  return { updatedDivisions, movedClimbers };
}

function printUpdatedDivisions(updatedDivisions) {
  console.log('\n===== UPDATED DIVISIONS =====');
  Object.entries(updatedDivisions).forEach(([divisionName, data]) => {
    console.log(
      `\n${divisionName} (Avg Combined Rank: ${data.averageCombinedRank})`
    );
    console.log('---------------------------------------------------');
    data.rankings.forEach((climber, index) => {
      console.log(
        `${index + 1}. ${climber.name} - Combined Rank: ${
          climber.combinedRank
        } (Boulder: ${climber.boulderRank}, Rope: ${climber.ropeRank})`
      );
    });
  });
}

export function calculateScores(boulderScores, ropeScores, divisions) {
  const boulderScoresRanked = rankScores(boulderScores);
  const ropeScoresRanked = rankScores(ropeScores);

  const combinedScores = combineScores(boulderScoresRanked, ropeScoresRanked);
  const rawDivisionRankings = rankByDivision(combinedScores, divisions);
  const adjustedRankings = adjustDivisions(rawDivisionRankings);

  return {
    combinedScores,
    adjustedRankings,
    boulderScoresRanked,
    ropeScoresRanked,
  };
}

export function formatMixerDataFromDatabase(
  divisions,
  boulderScores,
  ropeScores
) {
  const formattedBoulderScores = boulderScores.map(
    ({ climber, score, attempts }) => ({
      name: climber.name,
      score,
      attempts,
    })
  );
  const formattedRopeScores = ropeScores.map(
    ({ climber, score, attempts }) => ({
      name: climber.name,
      score,
      attempts,
    })
  );
  const formattedDivisions = divisions.reduce((acc, division) => {
    acc[division.name] = division.climbers.map((climber, index) => ({
      id: index,
      name: climber.name,
    }));
    return acc;
  }, {});

  return { formattedDivisions, formattedBoulderScores, formattedRopeScores };
}
