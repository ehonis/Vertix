export function convertToEST(date) {
  // Clone the original date to avoid modifying it
  const estDate = new Date(date);

  // Calculate the offset for EST (UTC-5 during standard time or UTC-4 for daylight saving time)
  const isDST = estDate.getTimezoneOffset() === 240; // 240 min offset for EDT
  const offset = isDST ? 4 : 5;

  // Adjust the date to the EST timezone by subtracting the offset
  estDate.setHours(estDate.getUTCHours() - offset);

  return estDate;
}

export function formatDate(date) {
  const estDate = convertToEST(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}
