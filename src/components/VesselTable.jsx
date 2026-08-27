import React from 'react';
import { Ship, Anchor, ArrowRight, Clock } from 'lucide-react';
import { VESSEL_MOVEMENTS } from '../data/mockData';

export function VesselTable() {
  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Inter-Island Vessels</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time status of major domestic sea routes</p>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          View All Movements
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="p-4 pl-6">Vessel Name</th>
              <th className="p-4">Route</th>
              <th className="p-4">Status</th>
              <th className="p-4">Schedule</th>
              <th className="p-4 pr-6 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {VESSEL_MOVEMENTS.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 pl-6 font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-3">
                    <Anchor className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold">{row.vessel}</p>
                      <p className="text-[10px] text-slate-400">{row.imo}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{row.route}</span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${row.statusClass}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {row.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span><strong className="text-slate-700 dark:text-slate-200">{row.timeLabel}:</strong> {row.time}</span>
                  </div>
                </td>
                <td className="p-4 pr-6 text-right">
                  <button className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1">
                    Track <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}