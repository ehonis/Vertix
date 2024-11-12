export function convertToEST(date) {
  // Clone the date to avoid modifying the original
  const estDate = new Date(date);

  // Determine if the date falls in daylight saving time (EDT) or standard time (EST)
  const month = estDate.getUTCMonth(); // getUTCMonth gives months from 0 (January) to 11 (December)
  const isDST = month >= 2 && month < 10; // DST is from March (2) to November (9)

  // Apply the offset: UTC-4 for DST, UTC-5 for standard
  const offset = isDST ? 4 : 5;
  estDate.setUTCHours(estDate.getUTCHours() - offset);

  return estDate;
}

export function findDaysOld(date) {
  const today = new Date();
  const setDate = convertToEST(date);
  const differenceInTime = today - setDate; // Difference in milliseconds
  const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return differenceInDays;
}

export function formatDate(date) {
  const estDate = convertToEST(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

export function formatDateString(date) {
  const estDate = convertToEST(date);

  const year = estDate.getFullYear();
  const month = estDate.getMonth(); // Note: months are 0-indexed
  const day = estDate.getDate();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Construct the date string
  return `${monthNames[month]} ${day}, ${year}`;
}

export function parseDateString(dateString) {
  const [month, day, year] = dateString.split('/').map(Number); // Extract month, day, and year as numbers
  return new Date(year, month - 1, day); // Create and return a Date object (months are 0-indexed in JS)
}
