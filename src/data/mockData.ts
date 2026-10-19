import type { LucideIcon } from "lucide-react";
import {
  Anchor,
  Bell,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Navigation,
  Settings,
  Ship,
  Ticket,
  Users,
} from "lucide-react";

export type NavigationItem = {
  name: string;
  icon: LucideIcon;
  badge?: boolean;
};

export type VesselMovement = {
  vessel: string;
  imo: string;
  route: string;
  status: string;
  statusClass: string;
  timeLabel: string;
  time: string;
};

export type DashboardVessel = {
  vessel: string;
  route: string;
  detailLabel: string;
  detail: string;
};

export type OperationsAlert = {
  vessel: string;
  priority: "High" | "Medium";
  title: string;
  note: string;
  time: string;
};

export type Route = {
  id: string;
  name: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  status: string;
};

export type Port = {
  id: string;
  name: string;
  code: string;
  region: string;
  status: string;
};

export const MOCK_PORTS: Port[] = [
  {
    id: "port-1",
    name: "Port of Manila (South Harbor)",
    code: "PH MNL",
    region: "Luzon, Philippines",
    status: "Active",
  },
  {
    id: "port-2",
    name: "Cebu International Port",
    code: "PH CEB",
    region: "Visayas, Philippines",
    status: "Active",
  },
  {
    id: "port-3",
    name: "Batangas Port",
    code: "PH BTG",
    region: "Calabarzon, Philippines",
    status: "Active",
  },
  {
    id: "port-4",
    name: "Davao Port Terminal",
    code: "PH DVO",
    region: "Mindanao, Philippines",
    status: "Maintenance",
  },
];

export const PASSENGER_BUNK_AREAS = [
  {
    id: "bunk-area-tourist-a",
    label: "Tourist Sec A",
    accommodation: "Tourist",
    beds: [
      {
        id: "b1",
        label: "T-01",
        level: "Lower",
        x: 20,
        y: 20,
        isVertical: false,
        status: "Available",
      },
      {
        id: "b2",
        label: "T-01",
        level: "Top",
        x: 20,
        y: 80,
        isVertical: false,
        status: "Available",
      },
    ],
  },
];

export const BUNK_CONFIGURATION_STORAGE_KEY =
  "shipping-prototype-passenger-bunk-areas";
export const SHIP_PLAN_STORAGE_KEY = "shipping-prototype-ship-plan";

export const NAV_ITEMS: NavigationItem[] = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Vessels", icon: Ship },
  { name: "Voyages", icon: CalendarDays },
  { name: "Bookings", icon: Ticket },
  { name: "Ports Manager", icon: Anchor },
  { name: "Routes", icon: Navigation },
  { name: "Reports", icon: FileText },
  { name: "Users", icon: Users },
  { name: "Settings", icon: Settings },
];

export const VESSEL_MOVEMENTS: VesselMovement[] = [
  {
    vessel: "Sample Vessel",
    imo: "IMO: 9812345",
    route: "Manila North Port -> Port of Cebu",
    status: "Underway",
    statusClass: "text-orange-500 bg-orange-500/10",
    timeLabel: "ETA",
    time: "24 Aug, 13:00",
  },
];

export const VESSELS_AT_BAY: DashboardVessel[] = [
  {
    vessel: "MV Harborlight",
    route: "Manila → Cebu",
    detailLabel: "Berth",
    detail: "Pier 4 · unloading",
  },
  {
    vessel: "MV Pacific Crest",
    route: "Batangas → Calapan",
    detailLabel: "Berth",
    detail: "Terminal 2 · turnaround",
  },
];

export const ARRIVING_VESSELS: DashboardVessel[] = [
  {
    vessel: "MV Island Trader",
    route: "Manila → Cebu",
    detailLabel: "ETA",
    detail: "10:45 · 35 min",
  },
  {
    vessel: "MV Coastal Star",
    route: "Cebu → Tagbilaran",
    detailLabel: "ETA",
    detail: "12:20 · 2 hr 10 min",
  },
  {
    vessel: "MV Northwind",
    route: "Batangas → Puerto Galera",
    detailLabel: "ETA",
    detail: "14:00 · 3 hr 50 min",
  },
];

export const OPERATIONS_ALERTS: OperationsAlert[] = [
  {
    vessel: "MV Island Trader",
    priority: "High",
    title: "Arrival running late",
    note: "30 min behind schedule. Revised berth window is not yet confirmed.",
    time: "Updated 10:10",
  },
  {
    vessel: "MV Coastal Star",
    priority: "Medium",
    title: "Departure clearance pending",
    note: "Port clearance is not logged. Confirm with the port agent before cutoff.",
    time: "Updated 09:40",
  },
];

export const MOCK_ROUTES: Route[] = [
  {
    id: "route-1",
    name: "Manila - Cebu Express",
    origin: "Port of Manila (South Harbor)",
    originCode: "PH MNL",
    destination: "Cebu International Port",
    destinationCode: "PH CEB",
    status: "Active",
  },
  {
    id: "route-2",
    name: "Batangas - Cebu Freight",
    origin: "Batangas Port",
    originCode: "PH BTG",
    destination: "Cebu International Port",
    destinationCode: "PH CEB",
    status: "Active",
  },
];
