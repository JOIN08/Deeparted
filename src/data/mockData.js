import { 
  LayoutDashboard, 
  Ship, 
  Package, 
  Anchor, 
  Navigation, 
  CloudSun, 
  Bell, 
  FileText, 
  Users, 
  Settings 
} from 'lucide-react';

export const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Vessels', icon: Ship },
  /*{ name: 'Cargo', icon: Package },*/
  { name: 'Ports Manager', icon: Anchor },
  { name: 'Routes', icon: Navigation },
  /*{ name: 'Weather', icon: CloudSun, badge: true },*/
  /*{ name: 'Alerts', icon: Bell },*/
  { name: 'Reports', icon: FileText },
  { name: 'Users', icon: Users },
  { name: 'Settings', icon: Settings },
];

export const VESSEL_MOVEMENTS = [
  { 
    vessel: 'Sample Vessel', 
    imo: 'IMO: 9812345', 
    route: 'Manila North Port → Port of Cebu', 
    status: 'Underway', 
    statusClass: 'text-orange-500 bg-orange-500/10', 
    timeLabel: 'ETA', 
    time: '24 Aug, 13:00' 
  },
];

export const MOCK_ROUTES = [
  {
    id: 'route-1',
    name: 'Manila - Cebu Express',
    origin: 'Port of Manila (South Harbor)',
    originCode: 'PH MNL',
    destination: 'Cebu International Port',
    destinationCode: 'PH CEB',
    status: 'Active'
  },
  {
    id: 'route-2',
    name: 'Batangas - Cebu Freight',
    origin: 'Batangas Port',
    originCode: 'PH BTG',
    destination: 'Cebu International Port',
    destinationCode: 'PH CEB',
    status: 'Active'
  }
];