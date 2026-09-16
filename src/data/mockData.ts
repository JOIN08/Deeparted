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

export type Route = {
  id: string;
  name: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  status: string;
};

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
