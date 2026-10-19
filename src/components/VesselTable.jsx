import { useCallback, useEffect, useState } from "react";
import {
  Anchor,
  Archive,
  LockKeyhole,
  Pencil,
  Plus,
  Ship,
  UserRound,
  X,
} from "lucide-react";
import {
  DECOMMISSIONED_VESSELS_STORAGE_KEY,
  VESSELS_STORAGE_KEY,
  getVesselById,
  loadDecommissionedVessels,
  loadVessels,
  saveDecommissionedVessels,
  saveVessels,
} from "../data/vesselStorage";
import {
  loadVoyageSchedules,
  saveVoyageSchedules,
} from "../data/voyageSchedules";
import { APP_ROUTE_PATHS } from "../config/appConfig";

const STATUS_STYLES = {
  "In service":
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  "At sea":
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-github-border dark:bg-github-raised dark:text-github-accent",
  Maintenance:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
};

const EMPTY_AUTHORIZATION = {
  name: "",
  username: "",
  password: "",
  reason: "",
};

export function VesselTable({ canEdit = false }) {
  const [vessels, setVessels] = useState(loadVessels);
  const [newVesselName, setNewVesselName] = useState("");
  const [error, setError] = useState("");
  const [action, setAction] = useState(null);
  const [authorization, setAuthorization] = useState(EMPTY_AUTHORIZATION);
  const [actionError, setActionError] = useState("");
  const [newName, setNewName] = useState("");

  const refreshVessels = useCallback(() => setVessels(loadVessels()), []);

  useEffect(() => {
    const refresh = (event) => {
      if (
        event.type === "storage" &&
        event.key !== VESSELS_STORAGE_KEY &&
        event.key !== DECOMMISSIONED_VESSELS_STORAGE_KEY &&
        !event.key?.startsWith("deeparted-vessel-passenger-areas:")
      ) {
        return;
      }
      refreshVessels();
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("vessels-updated", refresh);
    window.addEventListener("passenger-bunks-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("vessels-updated", refresh);
      window.removeEventListener("passenger-bunks-updated", refresh);
    };
  }, [refreshVessels]);

  const commitVessels = (updatedVessels) => {
    try {
      saveVessels(updatedVessels);
      setVessels(updatedVessels.map((vessel) => ({
        ...vessel,
        capacity: loadVessels().find((item) => item.id === vessel.id)?.capacity || 0,
      })));
      setError("");
    } catch (saveError) {
      console.error("Unable to save vessel records.", saveError);
      setError("Could not save vessel changes. Check browser storage settings.");
    }
  };

  const addVessel = (event) => {
    event.preventDefault();
    if (!canEdit) return;
    const name = newVesselName.trim();
    if (!name) {
      setError("Enter a ship name.");
      return;
    }
    if (vessels.some((vessel) => vessel.name.toLowerCase() === name.toLowerCase())) {
      setError("A ship with that name already exists.");
      return;
    }
    commitVessels([
      ...vessels,
      {
        id: `vessel-${Date.now()}`,
        name,
        status: "In service",
      },
    ]);
    setNewVesselName("");
  };

  const updateStatus = (vesselId, status) => {
    if (!canEdit) return;
    commitVessels(
      vessels.map((vessel) =>
        vessel.id === vesselId ? { ...vessel, status } : vessel,
      ),
    );
  };

  const openAction = (type, vessel) => {
    if (!canEdit) return;
    setAction({ type, vessel });
    setNewName(type === "rename" ? vessel.name : "");
    setAuthorization(EMPTY_AUTHORIZATION);
    setActionError("");
  };

  const closeAction = () => {
    setAction(null);
    setAuthorization(EMPTY_AUTHORIZATION);
    setActionError("");
  };

  const submitAction = (event) => {
    event.preventDefault();
    if (!canEdit) return;
    if (
      !authorization.name.trim() ||
      !authorization.username.trim() ||
      !authorization.password
    ) {
      setActionError("Enter your full name, username, and password to continue.");
      return;
    }
    if (action.type === "rename") {
      const updatedName = newName.trim();
      if (!updatedName) {
        setActionError("Enter the ship's new name.");
        return;
      }
      if (
        vessels.some(
          (vessel) =>
            vessel.id !== action.vessel.id &&
            vessel.name.toLowerCase() === updatedName.toLowerCase(),
        )
      ) {
        setActionError("A ship with that name already exists.");
        return;
      }
      commitVessels(
        vessels.map((vessel) =>
          vessel.id === action.vessel.id
            ? { ...vessel, name: updatedName }
            : vessel,
        ),
      );
      closeAction();
      return;
    }
    if (!authorization.reason.trim()) {
      setActionError("Add a reason to the decommission record.");
      return;
    }

    const records = loadDecommissionedVessels();
    const previousSchedules = loadVoyageSchedules();
    const pausedScheduleIds = previousSchedules
      .filter(
        (schedule) =>
          schedule.vesselId === action.vessel.id &&
          schedule.status === "Active",
      )
      .map((schedule) => schedule.id);
    const pausedSchedules = previousSchedules.map((schedule) =>
      schedule.vesselId === action.vessel.id && schedule.status === "Active"
        ? { ...schedule, status: "Paused" }
        : schedule,
    );
    const record = {
      id: `decommission-${Date.now()}`,
      vessel: { ...getVesselById(action.vessel.id), ...action.vessel },
      decommissionedAt: new Date().toISOString(),
      decommissionedBy: {
        name: authorization.name.trim(),
        username: authorization.username.trim(),
      },
      reason: authorization.reason.trim(),
      pausedScheduleIds,
    };
    try {
      saveDecommissionedVessels([record, ...records]);
      saveVessels(vessels.filter((vessel) => vessel.id !== action.vessel.id));
      saveVoyageSchedules(pausedSchedules);
      setVessels(loadVessels());
      setError("");
      closeAction();
    } catch (saveError) {
      try {
        saveDecommissionedVessels(records);
      } catch (rollbackError) {
        console.error(
          "Unable to roll back an incomplete decommission record.",
          rollbackError,
        );
      }
      try {
        saveVessels(vessels);
      } catch (rollbackError) {
        console.error("Unable to restore the active vessel list.", rollbackError);
      }
      try {
        saveVoyageSchedules(previousSchedules);
      } catch (rollbackError) {
        console.error("Unable to restore voyage schedules.", rollbackError);
      }
      console.error("Unable to decommission vessel.", saveError);
      setActionError(
        "Could not save the decommission record. No ship was removed.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
            Fleet management
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <Ship className="h-6 w-6 text-blue-600" /> Vessels
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-github-muted">
            {canEdit
              ? "Manage ship details, passenger capacity, and deck layouts."
              : "View ship details, passenger capacity, and deck layouts."}
          </p>
        </div>
        <a
          href={APP_ROUTE_PATHS.decommissionedVessels}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-github-border dark:bg-github-canvas dark:text-slate-200 dark:hover:bg-github-raised"
        >
          <Archive className="h-4 w-4" />
          Decommissioned ships
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-github-panel">
            {loadDecommissionedVessels().length}
          </span>
        </a>
      </header>

      {canEdit && (
      <section className="overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-white via-white to-blue-50 shadow-sm dark:border-github-border dark:from-github-panel dark:via-github-canvas dark:to-github-panel">
        <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-600 p-3 text-white shadow-md shadow-blue-600/20">
              <Anchor className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Grow your fleet
              </h3>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-github-muted">
                Add a ship by name. Passenger capacity is calculated from the
                beds in its saved passenger compartments.
              </p>
            </div>
          </div>
          <form onSubmit={addVessel} className="flex flex-col gap-2 sm:min-w-[420px] sm:flex-row">
            <label className="sr-only" htmlFor="new-vessel-name">
              Ship name
            </label>
            <input
              id="new-vessel-name"
              required
              value={newVesselName}
              onChange={(event) => {
                setNewVesselName(event.target.value);
                setError("");
              }}
              placeholder="e.g. MV Island Explorer"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-github-border dark:bg-github-canvas dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Add ship
            </button>
          </form>
        </div>
        {error && (
          <p role="alert" className="border-t border-red-200 bg-red-50 px-6 py-2.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}
      </section>
      )}

      <section className="space-y-3">
        <div className="flex items-end justify-between px-1">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Active fleet</h3>
            <p className="mt-1 text-xs text-slate-500">
              {vessels.length} {vessels.length === 1 ? "ship" : "ships"} in service list
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Fleet register
          </span>
        </div>
        {vessels.length ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {vessels.map((vessel) => (
              <article
                key={vessel.id}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-github-border dark:bg-github-panel dark:hover:border-blue-900"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-600 dark:bg-github-panel dark:text-blue-400">
                      <Ship className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-bold text-slate-900 dark:text-white">
                        {vessel.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-github-muted">
                        {vessel.capacity} passenger{" "}
                        {vessel.capacity === 1 ? "bed" : "beds"} configured
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {canEdit ? (
                      <>
                        <label className="sr-only" htmlFor={`status-${vessel.id}`}>
                          {vessel.name} status
                        </label>
                        <select
                          id={`status-${vessel.id}`}
                          value={vessel.status}
                          onChange={(event) =>
                            updateStatus(vessel.id, event.target.value)
                          }
                          className={`rounded-full border px-2.5 py-1.5 text-[11px] font-semibold outline-none ${STATUS_STYLES[vessel.status] || STATUS_STYLES["In service"]}`}
                        >
                          {["In service", "At sea", "Maintenance"].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => openAction("rename", vessel)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 dark:border-github-border dark:text-github-text dark:hover:text-blue-300"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Rename
                        </button>
                      </>
                    ) : (
                      <span className={`rounded-full border px-2.5 py-1.5 text-[11px] font-semibold ${STATUS_STYLES[vessel.status] || STATUS_STYLES["In service"]}`}>
                        {vessel.status}
                      </span>
                    )}
                    <a
                      href={`${APP_ROUTE_PATHS.vesselLayout}?vesselId=${encodeURIComponent(vessel.id)}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      <Ship className="h-3.5 w-3.5" /> Ship layout
                    </a>
                    {canEdit && <button
                      type="button"
                      onClick={() => openAction("decommission", vessel)}
                      className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                    >
                      Decommission
                    </button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-github-border dark:bg-github-panel">
            <Ship className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              No active ships
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add a ship to start building your fleet.
            </p>
          </div>
        )}
      </section>

      {canEdit && action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitAction}
            className="w-full max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-github-border dark:bg-github-panel"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-github-border">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
                  Confirm fleet change
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {action.type === "rename"
                    ? `Rename ${action.vessel.name}`
                    : `Decommission ${action.vessel.name}`}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the responsible person&apos;s details to record this action.
                  Any active recurring schedules for this ship will be paused.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAction}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-github-raised dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {action.type === "rename" && (
              <label className="block text-xs font-semibold text-slate-600 dark:text-github-text">
                New ship name
                <input
                  required
                  autoFocus
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-github-border dark:bg-github-canvas dark:text-white"
                />
              </label>
            )}

            {action.type === "decommission" && (
              <label className="block text-xs font-semibold text-slate-600 dark:text-github-text">
                Decommission reason / notes
                <textarea
                  required
                  rows={3}
                  value={authorization.reason}
                  onChange={(event) =>
                    setAuthorization((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  placeholder="Record the reason and relevant details"
                  className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-github-border dark:bg-github-canvas dark:text-white"
                />
              </label>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
                Full name
                <span className="relative mt-1.5 block">
                  <UserRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    autoComplete="name"
                    value={authorization.name}
                    onChange={(event) =>
                      setAuthorization((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Responsible person's name"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-github-border dark:bg-github-canvas dark:text-white"
                  />
                </span>
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
                Username
                <input
                  required
                  autoComplete="username"
                  value={authorization.username}
                  onChange={(event) =>
                    setAuthorization((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  placeholder="Account username"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-github-border dark:bg-github-canvas dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-github-text sm:col-span-2">
                Password confirmation
                <span className="relative mt-1.5 block">
                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="password"
                    autoComplete="current-password"
                    value={authorization.password}
                    onChange={(event) =>
                      setAuthorization((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Re-enter password"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-github-border dark:bg-github-canvas dark:text-white"
                  />
                </span>
              </label>
            </div>

            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              Prototype confirmation: these credentials are required as an
              acknowledgement but cannot be verified by the current app. The
              password is never stored.
            </p>
            {actionError && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {actionError}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-github-border">
              <button
                type="button"
                onClick={closeAction}
                className="rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-github-text dark:hover:bg-github-raised"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`rounded-lg px-4 py-2.5 text-xs font-bold text-white ${
                  action.type === "decommission"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {action.type === "rename" ? "Save new name" : "Confirm decommission"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
