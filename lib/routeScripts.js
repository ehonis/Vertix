export function getTicks(data) {
  let highest_count = 0;

  data.forEach((route) => {
    if (route.count > highest_count) {
      highest_count = route.count;
    }
  });

  return highest_count;
}

export function findType(routeGrade) {
  if (routeGrade[0] == 'v') {
    return 'boulder';
  } else {
    return 'rope';
  }
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US');
}
