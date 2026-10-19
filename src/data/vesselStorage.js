import { PASSENGER_BUNK_AREAS } from "./mockData";

export const VESSELS_STORAGE_KEY = "deeparted-vessels";
export const DECOMMISSIONED_VESSELS_STORAGE_KEY =
  "deeparted-decommissioned-vessels";
export const DEFAULT_VESSELS = [
  { id: "vessel-1", name: "MV Trans-Asia 12", status: "In service" },
  { id: "vessel-2", name: "MV Cebu Star", status: "In service" },
  { id: "vessel-3", name: "MV Island Trader", status: "At sea" },
];

const getPassengerCapacity = (vesselId) => {
  const storedAreas = window.localStorage.getItem(
    getVesselPassengerAreasStorageKey(vesselId),
  );
  const legacyAreas =
    vesselId === "vessel-1" &&
    window.localStorage.getItem("shipping-prototype-passenger-bunk-areas");
  const areas = storedAreas || legacyAreas;
  const parsedAreas = areas ? JSON.parse(areas) : PASSENGER_BUNK_AREAS;
  if (!Array.isArray(parsedAreas)) {
    throw new Error(`Passenger compartments for ${vesselId} are invalid.`);
  }
  return parsedAreas.reduce((total, area) => {
    if (!Array.isArray(area.beds)) {
      throw new Error(`Passenger compartment ${area.label || area.id} has invalid beds.`);
    }
    return total + area.beds.length;
  }, 0);
};

export const loadVessels = () => {
  try {
    const savedVessels = window.localStorage.getItem(VESSELS_STORAGE_KEY);
    const vessels = savedVessels ? JSON.parse(savedVessels) : DEFAULT_VESSELS;
    if (!Array.isArray(vessels)) {
      throw new Error("Saved vessels are not a list.");
    }
    return vessels.map((vessel) => {
      try {
        return { ...vessel, capacity: getPassengerCapacity(vessel.id) };
      } catch (error) {
        console.error(
          `Unable to calculate passenger capacity for ${vessel.name}.`,
          error,
        );
        return { ...vessel, capacity: 0 };
      }
    });
  } catch (error) {
    console.error("Unable to load vessels.", error);
    return DEFAULT_VESSELS.map((vessel) => ({ ...vessel, capacity: 0 }));
  }
};

export const saveVessels = (vessels) => {
  window.localStorage.setItem(VESSELS_STORAGE_KEY, JSON.stringify(vessels));
  window.dispatchEvent(new Event("vessels-updated"));
};

export const loadDecommissionedVessels = () => {
  try {
    const storedRecords = window.localStorage.getItem(
      DECOMMISSIONED_VESSELS_STORAGE_KEY,
    );
    if (!storedRecords) return [];
    const records = JSON.parse(storedRecords);
    if (!Array.isArray(records)) {
      throw new Error("Decommissioned vessel records are not a list.");
    }
    return records;
  } catch (error) {
    console.error("Unable to load decommissioned vessel records.", error);
    return [];
  }
};

export const saveDecommissionedVessels = (records) => {
  window.localStorage.setItem(
    DECOMMISSIONED_VESSELS_STORAGE_KEY,
    JSON.stringify(records),
  );
};

export const getVesselById = (vesselId) => {
  const activeVessel = loadVessels().find((vessel) => vessel.id === vesselId);
  if (activeVessel) return activeVessel;
  const archivedVessel = loadDecommissionedVessels().find(
    (record) => record.vessel.id === vesselId,
  )?.vessel;
  return archivedVessel || DEFAULT_VESSELS.find((vessel) => vessel.id === vesselId);
};

export const getVesselLayoutStorageKey = (vesselId) =>
  `deeparted-vessel-layout:${vesselId}`;

export const getVesselPassengerAreasStorageKey = (vesselId) =>
  `deeparted-vessel-passenger-areas:${vesselId}`;
