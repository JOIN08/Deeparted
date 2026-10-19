import { ArrowLeft, Ship } from "lucide-react";
import { ShipBuilder } from "./ShipBuilder";
import { loadVessels } from "../data/vesselStorage";
import { APP_ROUTE_PATHS } from "../config/appConfig";

export function VesselLayoutPage({ canEdit = false }) {
  const vesselId = new URLSearchParams(window.location.search).get("vesselId");
  const vessel = loadVessels().find((item) => item.id === vesselId);

  if (!vessel) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <p className="text-sm text-slate-600 dark:text-github-text">
          This ship could not be found.
        </p>
        <a
          href={APP_ROUTE_PATHS.vesselList}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Return to vessels
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-5 bg-ui-canvas p-4 font-sans text-ui-ink dark:bg-github-canvas dark:text-github-text sm:p-8">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-github-border sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a
              href={APP_ROUTE_PATHS.vesselList}
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to vessels
            </a>
            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Ship className="h-5 w-5 text-blue-600" />
              {vessel.name} · Ship layout
            </h1>
          </div>
        </div>
        <ShipBuilder
          vesselId={vessel.id}
          vesselName={vessel.name}
          canEdit={canEdit}
        />
      </div>
    </main>
  );
}
