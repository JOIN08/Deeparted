import { Archive, ArrowLeft, CalendarClock, Ship, UserRound } from "lucide-react";
import { loadDecommissionedVessels } from "../data/vesselStorage";
import { APP_ROUTE_PATHS } from "../config/appConfig";

const formatDate = (value) =>
  new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export function DecommissionedVessels() {
  const records = loadDecommissionedVessels();

  return (
    <main className="min-h-screen bg-ui-canvas px-4 py-8 font-sans text-ui-ink dark:bg-github-canvas dark:text-github-text sm:px-8">
      <div className="mx-auto max-w-[1100px] space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-github-border sm:flex-row sm:items-end sm:justify-between">
          <div>
            <a
              href={APP_ROUTE_PATHS.vesselList}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to vessels
            </a>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
              Fleet history
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              <Archive className="h-6 w-6 text-blue-600" />
              Decommissioned ships
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-github-muted">
              Archived vessels and the operator-recorded reason for removal.
            </p>
          </div>
          <span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-github-panel dark:text-github-text">
            {records.length} archived
          </span>
        </header>

        {records.length ? (
          <section className="grid gap-4">
            {records.map((record) => (
              <article
                key={record.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-github-border dark:bg-github-panel"
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-github-border sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-500 dark:bg-github-panel dark:text-github-text">
                      <Ship className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white">
                        {record.vessel.name}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {record.vessel.capacity} configured passenger beds ·
                        Status before decommission: {record.vessel.status}
                      </p>
                    </div>
                  </div>
                  <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatDate(record.decommissionedAt)}
                  </p>
                </div>
                <div className="grid gap-4 pt-4 sm:grid-cols-[1fr_2fr]">
                  <div>
                    <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      <UserRound className="h-3 w-3" /> Recorded by
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {record.decommissionedBy.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      @{record.decommissionedBy.username}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Reason / notes
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-github-text">
                      {record.reason}
                    </p>
                    {record.pausedScheduleIds?.length > 0 && (
                      <p className="mt-2 text-[11px] text-slate-500">
                        {record.pausedScheduleIds.length} active recurring{" "}
                        {record.pausedScheduleIds.length === 1
                          ? "schedule was"
                          : "schedules were"}{" "}
                        paused.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-github-border dark:bg-github-panel">
            <Archive className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-600" />
            <h2 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
              No ships have been decommissioned
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              When a ship is decommissioned, its details and operator notes are
              kept here.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
