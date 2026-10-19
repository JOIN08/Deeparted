import { MOCK_PORTS, MOCK_ROUTES } from "./mockData";

export const PORTS_STORAGE_KEY = "deeparted-ports";
export const ROUTES_STORAGE_KEY = "deeparted-routes";

function loadRecords(storageKey, defaults, label) {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === null) return defaults.map((record) => ({ ...record }));

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error(`Saved ${label} records are not a list.`);
    }
    return parsed;
  } catch (error) {
    console.error(`Unable to load ${label} records.`, error);
    return defaults.map((record) => ({ ...record }));
  }
}

export function loadPorts() {
  return loadRecords(PORTS_STORAGE_KEY, MOCK_PORTS, "port");
}

export function savePorts(ports) {
  window.localStorage.setItem(PORTS_STORAGE_KEY, JSON.stringify(ports));
}

export function loadRoutes() {
  return loadRecords(ROUTES_STORAGE_KEY, MOCK_ROUTES, "route");
}

export function saveRoutes(routes) {
  window.localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
}
