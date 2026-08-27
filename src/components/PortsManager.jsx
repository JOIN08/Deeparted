import React, { useState } from 'react';
import { 
  Anchor, Plus, Search, MapPin, Fuel, Box, Server, 
  AlertTriangle, CheckCircle2, MoreVertical, Edit2, Trash2, 
  Compass, ArrowUpRight, ShieldCheck 
} from 'lucide-react';

export function PortsManager() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial Ports & Hubs State
  const [ports, setPorts] = useState([
    {
      id: 'port-1',
      name: 'Port of Manila (South Harbor)',
      code: 'PH MNL',
      type: 'Major Seaport',
      region: 'Luzon, Philippines',
      berths: 12,
      occupiedBerths: 8,
      status: 'Active',
      services: ['Container Freight', 'Fuel Bunkering', 'Passenger Terminal', 'Cold Storage'],
      coordinates: '14.5833° N, 120.9667° E'
    },
    {
      id: 'port-2',
      name: 'Cebu International Port',
      code: 'PH CEB',
      type: 'Major Seaport',
      region: 'Visayas, Philippines',
      berths: 8,
      occupiedBerths: 7,
      status: 'Congested',
      services: ['Passenger Terminal', 'RORO Operations', 'Fuel Bunkering'],
      coordinates: '10.3000° N, 123.9000° E'
    },
    {
      id: 'port-3',
      name: 'Batangas Passenger & RORO Hub',
      code: 'PH BTG',
      type: 'Logistics Hub',
      region: 'Calabarzon, Philippines',
      berths: 6,
      occupiedBerths: 2,
      status: 'Active',
      services: ['RORO Operations', 'Passenger Terminal', 'Vehicle Logistics'],
      coordinates: '13.7565° N, 121.0583° E'
    },
    {
      id: 'port-4',
      name: 'Davao Sasa Port Terminal',
      code: 'PH DVO',
      type: 'Major Seaport',
      region: 'Mindanao, Philippines',
      berths: 10,
      occupiedBerths: 0,
      status: 'Maintenance',
      services: ['Bulk Cargo', 'Cold Storage'],
      coordinates: '07.1167° N, 125.6667° E'
    }
  ]);

  // New Port Form State
  const [newPort, setNewPort] = useState({
    name: '',
    code: '',
    type: 'Major Seaport',
    region: '',
    berths: 5,
    status: 'Active',
    services: [],
    coordinates: ''
  });

  const availableServices = [
    'Passenger Terminal',
    'RORO Operations',
    'Container Freight',
    'Fuel Bunkering',
    'Cold Storage',
    'Bulk Cargo',
    'Ship Repair'
  ];

  // Helper to toggle selected services in the form
  const toggleService = (service) => {
    if (newPort.services.includes(service)) {
      setNewPort({ ...newPort, services: newPort.services.filter(s => s !== service) });
    } else {
      setNewPort({ ...newPort, services: [...newPort.services, service] });
    }
  };

  // Add Port Handler
  const handleAddPort = (e) => {
    e.preventDefault();
    if (!newPort.name || !newPort.code) return alert('Please enter Port Name and Code.');

    const createdPort = {
      ...newPort,
      id: `port-${Date.now()}`,
      occupiedBerths: 0,
      berths: Number(newPort.berths) || 1
    };

    setPorts([createdPort, ...ports]);
    setIsModalOpen(false);
    setNewPort({
      name: '',
      code: '',
      type: 'Major Seaport',
      region: '',
      berths: 5,
      status: 'Active',
      services: [],
      coordinates: ''
    });
  };

  const removePort = (id) => {
    if (confirm('Are you sure you want to remove this port/hub?')) {
      setPorts(ports.filter(p => p.id !== id));
    }
  };

  // Filter Logic
  const filteredPorts = ports.filter(port => {
    const matchesTab = activeTab === 'All' || port.type === activeTab;
    const matchesSearch = port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          port.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          port.region.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Stats Overview */}
      <div className="bg-white dark:bg-[#0f172a] p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Anchor className="w-6 h-6 text-blue-500" /> Maritime Ports & Logistics Hubs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage oceanic terminals, docking capacity, and operational hub services.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Port / Hub
        </button>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Major Seaport', 'Logistics Hub'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === type
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type === 'All' ? 'All Terminals' : type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search port, UN/LOCODE, region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Ports Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredPorts.map((port) => {
          const occupancyRate = Math.round((port.occupiedBerths / port.berths) * 100);

          return (
            <div
              key={port.id}
              className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all p-5 flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 font-mono text-[10px] font-bold">
                      {port.code}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{port.type}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {port.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> {port.region}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {port.status === 'Active' && (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                  {port.status === 'Congested' && (
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Congested
                    </span>
                  )}
                  {port.status === 'Maintenance' && (
                    <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                      <Server className="w-3 h-3" /> Maintenance
                    </span>
                  )}
                </div>
              </div>

              {/* Berth Capacity & Occupancy Visualizer */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Anchor className="w-3.5 h-3.5 text-blue-500" /> Berth Capacity:
                  </span>
                  <span className="text-slate-900 dark:text-white font-mono">
                    {port.occupiedBerths} / {port.berths} Berths ({occupancyRate}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 overflow-hidden">
                  <div
                    style={{ width: `${occupancyRate}%` }}
                    className={`h-full transition-all ${
                      occupancyRate > 85
                        ? 'bg-amber-500'
                        : occupancyRate === 0
                        ? 'bg-slate-400'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* Available Services Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Terminal Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {port.services.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Compass className="w-3 h-3" /> {port.coordinates || 'N/A'}
                </span>

                <button
                  onClick={() => removePort(port.id)}
                  className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= ADD PORT MODAL DRAWER ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Anchor className="w-5 h-5 text-blue-500" /> Register New Port / Hub
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPort} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Port / Terminal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Port of Subic Bay"
                    value={newPort.name}
                    onChange={(e) => setNewPort({ ...newPort, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    UN/LOCODE / Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PH SBU"
                    value={newPort.code}
                    onChange={(e) => setNewPort({ ...newPort, code: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Terminal Type
                  </label>
                  <select
                    value={newPort.type}
                    onChange={(e) => setNewPort({ ...newPort, type: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Major Seaport">Major Seaport</option>
                    <option value="Logistics Hub">Logistics Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Total Berths
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newPort.berths}
                    onChange={(e) => setNewPort({ ...newPort, berths: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={newPort.status}
                    onChange={(e) => setNewPort({ ...newPort, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Congested">Congested</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Region / Location Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Central Luzon, Philippines"
                  value={newPort.region}
                  onChange={(e) => setNewPort({ ...newPort, region: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Service Selection Checklist */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                  Select Hub Capabilities & Services
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableServices.map((service) => {
                    const isSelected = newPort.services.includes(service);
                    return (
                      <button
                        type="button"
                        key={service}
                        onClick={() => toggleService(service)}
                        className={`px-2.5 py-1 text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Save Terminal
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}