export function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function convertToEST(date: Date) {
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

export function findDaysOld(date: Date) {
  // Get current date and time
  const today = new Date();

  // Set both dates to midnight to compare calendar days only
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Calculate the difference in milliseconds between the dates
  const differenceInTime = endDate.getTime() - startDate.getTime();

  // Convert milliseconds to days
  // This will now give us the exact number of calendar days between dates
  const differenceInDays = Math.round(differenceInTime / (1000 * 60 * 60 * 24));

  return differenceInDays;
}

export function formatDateMMDDYY(date: Date) {
  // Get month (0-11) and add 1 to make it 1-12, pad with leading zero if needed
  const month = String(date.getMonth() + 1).padStart(2, "0");
  // Get day of month, pad with leading zero if needed
  const day = String(date.getDate()).padStart(2, "0");
  // Get last two digits of year
  const year = String(date.getFullYear()).slice(-2);

  return `${month}/${day}/${year}`;
}
export function formatDateMMDD(date: Date) {
  // Get month (0-11) and add 1 to make it 1-12, pad with leading zero if needed
  const month = String(date.getMonth() + 1).padStart(2, "0");
  // Get day of month, pad with leading zero if needed
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}/${day}`;
}
