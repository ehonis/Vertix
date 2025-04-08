import dayjs from "dayjs";

export function getNewRoutes(int) {
  // Combine, Format, and sort all routes
  const combinedData = [...ropeRoutes, ...boulderRoutes];
  const formatedDates = combinedData.map(item => {
    return {
      ...item,
      date: dayjs(item.date).format("MM/DD/YYYY"),
    };
  });
  formatedDates.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
  // add however many routes to routeToShow.
  let routesToShow = [];
  for (let i = 0; i < int; i++) {
    routesToShow.push(formatedDates[i]);
  }
  return routesToShow;
}

export function getWallRoutes(wall) {
  let walls = [];
  if (wall === "main1") {
    ropeRoutes.forEach(route => {
      if (route.location === "main1") {
        walls.push(route);
      }
    });
  } else if (wall === "main2") {
    ropeRoutes.forEach(route => {
      if (route.location === "main2") {
        walls.push(route);
      }
    });
  } else if (wall === "AB") {
    ropeRoutes.forEach(route => {
      if (route.location === "AB") {
        walls.push(route);
      }
    });
  } else if (wall === "boulder1") {
    boulderRoutes.forEach(route => {
      if (route.location === "boulder1") {
        walls.push(route);
      }
    });
  } else if (wall === "boulder2") {
    boulderRoutes.forEach(route => {
      if (route.location === "boulder2") {
        walls.push(route);
      }
    });
  }
  return walls;
}

export function nameConverter(name) {
  let ConvertedName = "";
  if (name === "main1") {
    ConvertedName = "Chimney -> Arch";
  } else if (name === "main2") {
    ConvertedName = "Cave -> Arch ";
  } else if (name === "boulder1") {
    ConvertedName = "Slab -> Cave -> Vert";
  } else if (name === "boulder2") {
    ConvertedName = "Overhang -> Vert ";
  } else {
    ConvertedName = "Auto Belay";
  }
  return ConvertedName;
}
