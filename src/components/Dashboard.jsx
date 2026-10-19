import { AlertTriangle, ArrowRight, Anchor, Clock3, Ship } from 'lucide-react';
import {
  ARRIVING_VESSELS,
  OPERATIONS_ALERTS,
  VESSELS_AT_BAY,
} from '../data/mockData';

function MovementList({ title, vessels, icon: Icon, accent, emptyMessage }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white dark:border-github-border dark:bg-github-panel">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-github-border">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${accent}`} />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-github-raised dark:text-slate-200">
          {vessels.length}
        </span>
      </div>
      {vessels.length > 0 ? (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {vessels.map((vessel) => (
            <li key={vessel.vessel} className="flex items-start gap-3 px-4 py-3">
              <Ship className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-github-text">{vessel.vessel}</p>
                  <p className="text-xs font-medium text-slate-600 dark:text-github-text">
                    <span className="text-slate-400 dark:text-slate-500">{vessel.detailLabel} </span>
                    {vessel.detail}
                  </p>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-github-muted">{vessel.route}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-5 text-sm text-slate-500 dark:text-github-muted">{emptyMessage}</p>
      )}
    </section>
  );
}

export function Dashboard({ onNavigate, canViewVoyages = true }) {
  const summary = [
    {
      label: 'Vessels at bay',
      value: VESSELS_AT_BAY.length,
      detail: 'Currently alongside',
      icon: Anchor,
      color: 'text-teal-700 bg-teal-50 dark:bg-github-raised dark:text-github-text',
    },
    {
      label: 'Arriving today',
      value: ARRIVING_VESSELS.length,
      detail: 'Next arrival in 35 min',
      icon: Ship,
      color: 'text-sky-700 bg-sky-50 dark:bg-github-raised dark:text-github-text',
    },
    {
      label: 'Open alerts',
      value: OPERATIONS_ALERTS.length,
      detail: '1 high priority',
      icon: AlertTriangle,
      color: 'text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            Port operations
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Fleet overview</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-github-muted">
            A quick view of berth activity, arrivals, and items needing follow-up.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 dark:border-github-border dark:bg-github-panel dark:text-github-text">
          Sample operations data
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summary.map(({ label, value, detail, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-github-border dark:bg-github-panel"
          >
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-github-muted">{label}</p>
              <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-github-muted">{detail}</p>
            </div>
            <span className={`rounded-lg p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <div className="space-y-4">
          <MovementList
            title="At bay"
            vessels={VESSELS_AT_BAY}
            icon={Anchor}
            accent="text-teal-700"
            emptyMessage="No vessels currently alongside."
          />
          <MovementList
            title="Arriving"
            vessels={ARRIVING_VESSELS}
            icon={Clock3}
            accent="text-sky-700"
            emptyMessage="No scheduled arrivals."
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-github-border dark:bg-github-panel">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-github-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alerts &amp; notes</h3>
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              {OPERATIONS_ALERTS.length} open
            </span>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {OPERATIONS_ALERTS.map((alert) => (
              <li key={`${alert.vessel}-${alert.title}`} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-github-text">{alert.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-github-muted">{alert.vessel}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      alert.priority === 'High'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                    }`}
                  >
                    {alert.priority}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-github-text">{alert.note}</p>
                <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">{alert.time}</p>
              </li>
            ))}
          </ul>
          {canViewVoyages && (
            <div className="border-t border-slate-100 p-3 dark:border-github-border">
              <button
                type="button"
                onClick={() => onNavigate('Voyages')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100"
              >
                Review voyages
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
