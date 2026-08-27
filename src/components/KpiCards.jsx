import React from 'react';
import { Ship, Package, Anchor, AlertTriangle, TrendingUp } from 'lucide-react';

export function KpiCards() {
  const stats = [
    { label: 'Active Vessels', value: '42', sub: '+3 from yesterday', icon: Ship, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Cargo Volume', value: '18,450 TEU', sub: '92% capacity', icon: Package, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Active Ports', value: '14 Hubs', sub: 'All operational', icon: Anchor, color: 'text-sky-500 bg-sky-500/10' },
    { label: 'Weather Alerts', value: '2 Advisories', sub: 'Visayas & Mindanao', icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{item.value}</h3>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                {item.sub}
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${item.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}