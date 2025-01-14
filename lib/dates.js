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
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

export function formatDateString(date) {
  const estDate = convertToEST(date);

  const year = estDate.getFullYear();
  const month = estDate.getMonth(); // Note: months are 0-indexed
  const day = estDate.getDate();

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Construct the date string
  return `${monthNames[month]} ${day}, ${year}`;
}

export function parseDateString(dateString) {
  let day = '';
  let month = '';
  let year = '';

  if (dateString.startsWith('-', 4)) {
    // Split the string by the '-' delimiter
    const [yyyy, mm, dd] = dateString.split('-');

    // Assign the parts to year, day, and month
    year = Number(yyyy);
    day = Number(dd);
    month = Number(mm);
  } else {
    // Handle other formats (e.g., mm/dd/yyyy)
    const [mm, dd, yyyy] = dateString.split('/').map(Number);
    year = yyyy;
    month = mm;
    day = dd;
  }

  return new Date(year, month - 1, day);
}

export function formatDateToYYYYMMDD(inputDate) {
  // Ensure the input is a valid Date object
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  // Extract year, month, and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');

  // Return in the format YYYY-MM-DD
  return `${year}-${month}-${day}`;
}
