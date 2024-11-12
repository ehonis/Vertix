import { convertToEST } from './dates';

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

function groupByDay(routeCompletions) {
  const dayGroups = {};

  routeCompletions.forEach((completion) => {
    // Convert the completion date to EST and normalize to midnight

    // Format the date as MM/DD
    const day = completion.completionDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
    });

    if (!dayGroups[day]) {
      dayGroups[day] = { Day: day, Boulders: 0, Ropes: 0 };
    }

    // Count by type
    if (completion.route.type === 'boulder') {
      dayGroups[day].Boulders += 1;
    } else if (completion.route.type === 'rope') {
      dayGroups[day].Ropes += 1;
    }
  });

  // Convert to array format
  return Object.values(dayGroups);
}

function groupByMonth(routeCompletions) {
  const monthGroups = {};

  routeCompletions.forEach((completion) => {
    // Format the month as MM/YYYY
    const monthDate = new Date(completion.completionDate);
    const monthKey = `${
      monthDate.getUTCMonth() + 1
    }/${monthDate.getUTCFullYear()}`; // MM/YYYY format

    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = { Month: monthKey, Boulders: 0, Ropes: 0 };
    }

    // Count by type
    if (completion.route.type === 'boulder') {
      monthGroups[monthKey].Boulders += 1;
    } else if (completion.route.type === 'rope') {
      monthGroups[monthKey].Ropes += 1;
    }
  });

  // Convert to array format
  return Object.values(monthGroups);
}
export function getLineChartCompletionsData(routeCompletions, timePeriod) {
  //sort by dates overall
  routeCompletions.sort((a, b) => a.completionDate - b.completionDate);
  let data;
  if (timePeriod === 'Week') {
    data = groupByWeek(routeCompletions);
  } else if (timePeriod === 'Day') {
    data = groupByDay(routeCompletions);
  } else {
    data = groupByMonth(routeCompletions);
  }
  console.log(data);
  return data;
}
