import { useState } from 'react';
import { Navigation, Plus, Search, Trash2, ArrowRight } from 'lucide-react';
import { loadPorts, loadRoutes, saveRoutes } from '../data/operationsData';

export function Routes({ ports = [], canEdit = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const availablePorts = ports?.length ? ports : loadPorts();
  const [routesList, setRoutesList] = useState(loadRoutes);

  // Simplified Form State
  const [newRoute, setNewRoute] = useState({
    name: '',
    originId: '',
    destinationId: ''
  });

  const commitRoutes = (updatedRoutes) => {
    try {
      saveRoutes(updatedRoutes);
      setRoutesList(updatedRoutes);
      setError('');
      return true;
    } catch (saveError) {
      console.error('Unable to save route records.', saveError);
      setError('Could not save route changes. Check browser storage settings.');
      return false;
    }
  };

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!newRoute.name || !newRoute.originId || !newRoute.destinationId) {
      return alert('Please enter a route name and select both Origin and Destination.');
    }

    if (newRoute.originId === newRoute.destinationId) {
      return alert('Origin and Destination ports cannot be the same!');
    }

    const originPort = availablePorts.find(p => p.id === newRoute.originId);
    const destPort = availablePorts.find(p => p.id === newRoute.destinationId);
    if (!originPort || !destPort) {
      setError('Choose valid origin and destination ports.');
      return;
    }

    const createdRoute = {
      id: `route-${Date.now()}`,
      name: newRoute.name,
      origin: originPort.name,
      originCode: originPort.code,
      destination: destPort.name,
      destinationCode: destPort.code,
      status: 'Active'
    };

    if (commitRoutes([createdRoute, ...routesList])) {
      setIsModalOpen(false);
      setNewRoute({ name: '', originId: '', destinationId: '' });
    }
  };

  const removeRoute = (id) => {
    if (!canEdit) return;
    if (confirm('Delete this route?')) {
      commitRoutes(routesList.filter(r => r.id !== id));
    }
  };

  const filteredRoutes = routesList.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-github-panel p-6 border border-slate-200 dark:border-github-border shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-6 h-6 text-blue-500" /> Maritime Routes
          </h2>
          <p className="text-xs text-slate-500 dark:text-github-muted mt-1">
            {canEdit
              ? "Create connections between your registered ports and terminals."
              : "View connections between registered ports and terminals."}
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" /> Create Route
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-github-panel p-4 border border-slate-200 dark:border-github-border shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search route name or port..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
          />
        </div>
        {error && (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border p-5 shadow-sm space-y-4"
          >
            {/* Title & Status */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-github-border/80 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {route.name}
              </h3>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 shrink-0">
                {route.status}
              </span>
            </div>

            {/* Origin -> Destination Visualizer */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-github-panel/50 p-3 border border-slate-100 dark:border-github-border">
              {/* Origin */}
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Origin
                </span>
                <span className="font-mono text-[11px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 inline-block">
                  {route.originCode}
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {route.origin}
                </p>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 mx-2" />

              {/* Destination */}
              <div className="space-y-0.5 text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Destination
                </span>
                <span className="font-mono text-[11px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 inline-block">
                  {route.destinationCode}
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {route.destination}
                </p>
              </div>
            </div>

            {/* Footer Action */}
            {canEdit && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => removeRoute(route.id)}
                  className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Route
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Route Modal */}
      {canEdit && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border shadow-2xl w-full max-w-md p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-github-border pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-500" /> Create Route
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRoute} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Route Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manila - Cebu Express"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                />
              </div>

              {/* Origin Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Select Origin Port *
                </label>
                <select
                  required
                  value={newRoute.originId}
                  onChange={(e) => setNewRoute({ ...newRoute, originId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Origin --</option>
                  {availablePorts.map((port) => (
                    <option key={port.id} value={port.id}>
                      {port.name} ({port.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Select Destination Port *
                </label>
                <select
                  required
                  value={newRoute.destinationId}
                  onChange={(e) => setNewRoute({ ...newRoute, destinationId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Destination --</option>
                  {availablePorts.map((port) => (
                    <option key={port.id} value={port.id}>
                      {port.name} ({port.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-github-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-github-panel text-slate-700 dark:text-github-text text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Save Route
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}