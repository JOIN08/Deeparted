import React, { useState } from 'react';
import { Anchor, Plus, Search, MapPin, Trash2, CheckCircle2, AlertTriangle, Server } from 'lucide-react';

export function PortsManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Essential Port / Location Data
  const [ports, setPorts] = useState([
    {
      id: 'port-1',
      name: 'Port of Manila (South Harbor)',
      code: 'PH MNL',
      region: 'Luzon, Philippines',
      status: 'Active'
    },
    {
      id: 'port-2',
      name: 'Cebu International Port',
      code: 'PH CEB',
      region: 'Visayas, Philippines',
      status: 'Active'
    },
    {
      id: 'port-3',
      name: 'Batangas Port',
      code: 'PH BTG',
      region: 'Calabarzon, Philippines',
      status: 'Active'
    },
    {
      id: 'port-4',
      name: 'Davao Port Terminal',
      code: 'PH DVO',
      region: 'Mindanao, Philippines',
      status: 'Maintenance'
    }
  ]);

  // Streamlined Form State
  const [newPort, setNewPort] = useState({
    name: '',
    code: '',
    region: '',
    status: 'Active'
  });

  const handleAddPort = (e) => {
    e.preventDefault();
    if (!newPort.name || !newPort.code) return alert('Please enter Port Name and Code.');

    setPorts([{ ...newPort, id: `port-${Date.now()}` }, ...ports]);
    setIsModalOpen(false);
    setNewPort({ name: '', code: '', region: '', status: 'Active' });
  };

  const removePort = (id) => {
    if (confirm('Remove this port location?')) {
      setPorts(ports.filter(p => p.id !== id));
    }
  };

  const filteredPorts = ports.filter(port =>
    port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    port.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    port.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#0f172a] p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Anchor className="w-6 h-6 text-blue-500" /> Ports & Terminals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage origin and destination locations for fleet routes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Add Port
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#0f172a] p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search port name, code, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Minimal Locations List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPorts.map((port) => (
          <div
            key={port.id}
            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 font-mono text-[10px] font-bold">
                  {port.code}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                  {port.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> {port.region || 'N/A'}
                </p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {port.status === 'Active' ? (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                    <Server className="w-3 h-3" /> Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
              <button
                onClick={() => removePort(port.id)}
                className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Essential Add Port Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Anchor className="w-4 h-4 text-blue-500" /> Add New Location
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPort} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Port / Terminal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batangas Port"
                  value={newPort.name}
                  onChange={(e) => setNewPort({ ...newPort, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Location Code (UN/LOCODE) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PH BTG"
                  value={newPort.code}
                  onChange={(e) => setNewPort({ ...newPort, code: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Region / Island
                </label>
                <input
                  type="text"
                  placeholder="e.g. Luzon, Philippines"
                  value={newPort.region}
                  onChange={(e) => setNewPort({ ...newPort, region: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Operational Status
                </label>
                <select
                  value={newPort.status}
                  onChange={(e) => setNewPort({ ...newPort, status: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance / Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Save Location
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}