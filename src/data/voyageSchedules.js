export const VOYAGE_SCHEDULES_STORAGE_KEY = "deeparted-voyage-schedules";
export const VOYAGE_DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export const NEW_SCHEDULE_DEFAULTS = {
  routeId: "route-1",
  vesselId: "vessel-1",
  days: [1, 3, 5],
  departureTime: "08:00",
  arrivalTime: "16:00",
  fares: {},
};

export const DEFAULT_VOYAGE_SCHEDULES = [
  {
    id: "schedule-1",
    name: "Manila - Cebu Express",
    routeId: "route-1",
    vesselId: "vessel-1",
    days: [1, 3, 5],
    departureTime: "18:30",
    arrivalTime: "11:00",
    durationHours: 16,
    status: "Active",
    fares: { "bunk-area-tourist-a": 1500, "2": 1500 },
  },
  {
    id: "schedule-2",
    name: "Batangas - Cebu Freight",
    routeId: "route-2",
    vesselId: "vessel-2",
    days: [2, 4],
    departureTime: "08:00",
    arrivalTime: "22:00",
    durationHours: 14,
    status: "Paused",
    fares: { "bunk-area-tourist-a": 1500, "2": 1500 },
  },
];

export const loadVoyageSchedules = () => {
  try {
    const savedSchedules = window.localStorage.getItem(
      VOYAGE_SCHEDULES_STORAGE_KEY,
    );
    if (!savedSchedules) return DEFAULT_VOYAGE_SCHEDULES;
    const parsedSchedules = JSON.parse(savedSchedules);
    if (!Array.isArray(parsedSchedules)) {
      throw new Error("Saved voyage schedules are not a list.");
    }
    return parsedSchedules;
  } catch (error) {
    console.error("Unable to load voyage schedules.", error);
    return DEFAULT_VOYAGE_SCHEDULES;
  }
};

export const saveVoyageSchedules = (schedules) => {
  window.localStorage.setItem(
    VOYAGE_SCHEDULES_STORAGE_KEY,
    JSON.stringify(schedules),
  );
  window.dispatchEvent(new Event("voyage-schedules-updated"));
};

export const getFareForArea = (schedule, areaId) => {
  const fare = Number(schedule?.fares?.[areaId]);
  return Number.isFinite(fare) && fare > 0 ? fare : null;
};
