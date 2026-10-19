const LEGACY_BOOKINGS_KEY = "deeparted-booking-records";
const BOOKING_DAY_PREFIX = "deeparted-bookings-day:";
const BOOKING_DATES_KEY = "deeparted-booking-dates";

export const getBookingDayKey = (value = new Date()) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid booking date: ${value}`);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getBookingCreatedAt = (booking) => {
  if (booking.createdAt) return booking.createdAt;
  if (booking.heldUntil) {
    const heldUntil = new Date(booking.heldUntil);
    if (!Number.isNaN(heldUntil.getTime())) {
      return new Date(heldUntil.getTime() - 15 * 60 * 1000).toISOString();
    }
  }
  return new Date().toISOString();
};

const readBookingArray = (key) => {
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  const bookings = JSON.parse(raw);
  if (!Array.isArray(bookings)) {
    throw new Error(`Saved booking data in "${key}" is not a list.`);
  }
  return bookings;
};

const readBookingDates = () => {
  const savedDates = window.localStorage.getItem(BOOKING_DATES_KEY);
  if (!savedDates) return [];
  const dates = JSON.parse(savedDates);
  if (!Array.isArray(dates) || dates.some((date) => typeof date !== "string")) {
    throw new Error("Saved booking date index is invalid.");
  }
  return dates;
};

const listBookingDays = () => {
  const indexedDates = readBookingDates();
  if (indexedDates.length > 0) return indexedDates;
  const dates = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(BOOKING_DAY_PREFIX)) {
      dates.push(key.slice(BOOKING_DAY_PREFIX.length));
    }
  }
  return dates;
};

const migrateLegacyBookings = () => {
  if (window.localStorage.getItem(LEGACY_BOOKINGS_KEY) === null) return;

  const groupedBookings = new Map();
  for (const legacyBooking of readBookingArray(LEGACY_BOOKINGS_KEY)) {
    const booking = {
      ...legacyBooking,
      createdAt: getBookingCreatedAt(legacyBooking),
    };
    const day = getBookingDayKey(booking.createdAt);
    groupedBookings.set(day, [...(groupedBookings.get(day) || []), booking]);
  }

  const dates = new Set(listBookingDays());
  for (const [day, dayBookings] of groupedBookings) {
    const key = `${BOOKING_DAY_PREFIX}${day}`;
    const existing = readBookingArray(key);
    const existingIds = new Set(existing.map((booking) => booking.id));
    const merged = [
      ...existing,
      ...dayBookings.filter((booking) => !existingIds.has(booking.id)),
    ];
    window.localStorage.setItem(key, JSON.stringify(merged));
    dates.add(day);
  }

  window.localStorage.setItem(BOOKING_DATES_KEY, JSON.stringify([...dates].sort()));
  window.localStorage.removeItem(LEGACY_BOOKINGS_KEY);
};

export const loadTodayBookings = () => {
  const today = getBookingDayKey();
  const todayKey = `${BOOKING_DAY_PREFIX}${today}`;
  return readBookingArray(todayKey);
};

export const saveTodayBookings = (bookings) => {
  const today = getBookingDayKey();
  const datedBookings = bookings.map((booking) => ({
    ...booking,
    createdAt: booking.createdAt || new Date().toISOString(),
  }));
  window.localStorage.setItem(
    `${BOOKING_DAY_PREFIX}${today}`,
    JSON.stringify(datedBookings),
  );
  const dates = new Set(listBookingDays());
  dates.add(today);
  window.localStorage.setItem(
    BOOKING_DATES_KEY,
    JSON.stringify([...dates].sort()),
  );
};

export const searchPastBookings = ({ query, fromDate, toDate }) => {
  migrateLegacyBookings();
  const today = getBookingDayKey();
  const dates = listBookingDays()
    .filter((date) => date < today)
    .filter((date) => !fromDate || date >= fromDate)
    .filter((date) => !toDate || date <= toDate)
    .sort()
    .reverse();
  const normalizedQuery = query.trim().toLowerCase();
  const seenIds = new Set();
  const matches = [];
  let total = 0;
  const addMatch = (booking) => {
    total += 1;
    if (matches.length < 500) matches.push(booking);
  };

  for (const day of dates) {
    const bookings = readBookingArray(`${BOOKING_DAY_PREFIX}${day}`);
    for (const booking of bookings) {
      if (seenIds.has(booking.id)) continue;
      seenIds.add(booking.id);
      const searchText =
        `${booking.reference} ${booking.passengerName} ${booking.contact} ${booking.ticketNumber}`
          .toLowerCase();
      if (!normalizedQuery || searchText.includes(normalizedQuery)) {
        addMatch(booking);
      }
    }
  }

  matches.sort((left, right) =>
    getBookingCreatedAt(right).localeCompare(getBookingCreatedAt(left)),
  );
  return { matches, total };
};
