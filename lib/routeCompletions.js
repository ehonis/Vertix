import prisma from '@/prisma';
import { convertToEST } from './dates';
export async function getRouteCompletions(username) {
  try {
    const userWithCompletions = await prisma.user.findUnique({
      where: { username },
      include: {
        completions: {
          include: {
            route: true, // Include related route details
          },
        },
      },
    });

    // Return just the completions if you don't need the user data
    return userWithCompletions ? userWithCompletions.completions : null;
  } catch (error) {
    console.error('Error fetching route completions:', error);
    throw new Error('Failed to fetch route completions');
  }
}

export function getGradeCounts(ropeCompletions, boulderCompletions) {
  const boulderGradeCounts = boulderCompletions.reduce((acc, route) => {
    const grade = route.grade;
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});
  const ropeGradeCounts = ropeCompletions.reduce((acc, route) => {
    const grade = route.grade;
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  // Transform the gradeCounts object into an array for the chart
  const ropeTransformedData = Object.keys(ropeGradeCounts).map((grade) => ({
    grade,
    count: ropeGradeCounts[grade],
  }));
  const boulderTransformedData = Object.keys(boulderGradeCounts).map(
    (grade) => ({
      grade,
      count: boulderGradeCounts[grade],
    })
  );

  return {
    ropeTransformedData,
    boulderTransformedData,
  };
}
export function getTypeCounts(ropes, boulders) {
  const boulderTypeCounts = boulders.reduce((acc, route) => {
    const type = route.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const ropeTypeCounts = ropes.reduce((acc, route) => {
    const type = route.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  return { boulderTypeCounts, ropeTypeCounts };
}
export async function getPieChartCompletionsData(userId) {
  try {
    const completions = await getRouteCompletions(userId);

    // Process or filter completions by type here if needed
    // Example: Filter only rope completions
    const routes = completions.map((completion) => completion.route);

    const ropeCompletions = routes.filter((route) => route.type === 'rope');
    const boulderCompletions = routes.filter(
      (route) => route.type === 'boulder'
    );
    return getTypeCounts(ropeCompletions, boulderCompletions); // or any other filtered results
  } catch (error) {
    console.error('Error fetching route completions:', error);
  }
}

function getStartOfWeek(date) {
  const day = new Date(date);
  const dayOfWeek = day.getUTCDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Shift days to get Monday as start
  day.setUTCDate(day.getUTCDate() + diff); // Adjust date to the start of the week (Monday)
  return new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
  );
}

// Group routes by week
function groupByWeek(routeCompletions) {
  const weekGroups = {};

  routeCompletions.forEach((completion) => {
    const weekStart = getStartOfWeek(completion.completionDate);
    const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

    if (!weekGroups[weekKey]) {
      weekGroups[weekKey] = { Week: weekKey, Boulders: 0, Ropes: 0 };
    }

    // Count by type
    if (completion.route.type === 'boulder') {
      weekGroups[weekKey].Boulders += 1;
    } else if (completion.route.type === 'rope') {
      weekGroups[weekKey].Ropes += 1;
    }
  });

  // Convert to array format
  return Object.values(weekGroups);
}

export async function getLineChartCompletionsData(userId) {
  const completions = await getRouteCompletions(userId);
  //filter by type

  //convert to est
  completions.forEach((routeCompletion) => {
    routeCompletion.completionDate = convertToEST(
      routeCompletion.completionDate
    );
  });
  //sort by dates overall
  completions.sort((a, b) => a.completionDate - b.completionDate);

  const weeklyData = groupByWeek(completions);

  return weeklyData;
}

export async function findIfCompleted(userId, routeId) {
  try {
    const completion = await prisma.routeCompletion.findFirst({
      where: {
        userId: userId,
        routeId: routeId,
      },
    });

    return completion !== null;
  } catch (error) {
    console.error('failed to get route status error: ', error);
    throw new Error('failed to check route compeletion status');
  }
}
