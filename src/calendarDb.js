class CalendarDB {
  constructor(records = null, config = { allowGaps: false }) {
    // bind all methods
  }
  addRecord(dateKey = null) {
    // check if date exists
    // if exists, update existing
    // if ! allowGaps, check for last record and fill in gaps
  }
  removeRecord(dateKey) {}
  getRecords() {}
  _getDateKey() {}
}

export const PREV = "prev";
export const NEXT = "next";

// useful array with days in order of JS "day"
export const DOW = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getDow(dayIndex) {
  return DOW[dayIndex] || null;
}

export function getMonth(monthIndex) {
  return months[monthIndex] || null;
}

export function getDateKey(date = new Date()) {
  const keyMonth = date.getMonth();
  const keyDate = date.getDate();
  const keyYear = date.getFullYear();
  return new Date(keyYear, keyMonth, keyDate).getTime().toString();
}

export function getDateFromKey(date) {
  try {
    return new Date(parseInt(date, 10));
  } catch (err) {
    return undefined;
  }
}

export function getAdjacentDateKey(dateKey, dir) {
  let adjacentDate;
  if (dir === PREV) {
    adjacentDate = (d => new Date(d.setDate(d.getDate() - 1)))(
      getDateFromKey(dateKey),
    );
  }
  if (dir === NEXT) {
    adjacentDate = (d => new Date(d.setDate(d.getDate() + 1)))(
      getDateFromKey(dateKey),
    );
  }
  return getDateKey(adjacentDate);
}

export function getYesterdayDateKey() {
  const yesterday = (d => new Date(d.setDate(d.getDate() - 1)))(new Date());
  return getDateKey(yesterday);
}

function addDays(date = new Date(), days = 1) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDayIdsBetweenDayIds(firstDayId, secondDayId) {
  // ensure both ids provided and are INTs
  if (!firstDayId || !secondDayId) {
    return null;
  }

  if (typeof firstDayId !== "number") {
    firstDayId = parseInt(firstDayId, 10);
  }
  if (typeof secondDayId !== "number") {
    secondDayId = parseInt(secondDayId, 10);
  }

  console.log("in days between");
  console.log(firstDayId, secondDayId);

  const dayIds = [];
  const firstDate = new Date(parseInt(firstDayId, 10));
  let dateToAdd = addDays(firstDate);
  let dayId = getDateKey(dateToAdd);

  let loopControl = 0;
  while (dayId <= secondDayId && loopControl < 100) {
    dayIds.push(dayId);
    dateToAdd = addDays(dateToAdd);
    dayId = getDateKey(dateToAdd);
    loopControl++;
  }
  return dayIds;
}

export function getTimestampFromTimeObj(dateKey, timeObj) {
  try {
    const date = new Date(parseInt(dateKey, 10));
    date.setHours(timeObj.hours);
    date.setMinutes(timeObj.minutes);
    return date.getTime();
  } catch (err) {
    return undefined;
  }
}

export function getFriendlyDate(timestamp) {
  if (typeof timestamp === "string") {
    timestamp = parseInt(timestamp, 10);
  }
  const today = new Date(timestamp);
  const dow = getDow(today.getDay());
  const month = months[today.getMonth()];
  const date = today.getDate();
  return `${dow}, ${month} ${date}`;
}

export function getFriendlyTime(timestamp) {
  const date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  // let { hours, minutes } = timeObj;
  if (hours === 0 && minutes === 0) {
    return "Midnight";
  }
  if (hours === 12 && minutes === 0) {
    return "Noon";
  }
  let ampm = "am";
  if (hours > 12) {
    ampm = "pm";
    hours = hours - 12;
  }
  if (hours === 0) hours = "12";
  minutes = minutes === 0 ? "" : `:${minutes}`;

  return `${hours}${minutes}${ampm}`;
}
