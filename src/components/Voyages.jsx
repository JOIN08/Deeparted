import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Anchor,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Pause,
  Play,
  Plus,
  Ship,
  Users,
  X,
} from "lucide-react";
import {
  BUNK_CONFIGURATION_STORAGE_KEY,
  MOCK_ROUTES,
  PASSENGER_BUNK_AREAS,
} from "../data/mockData";
import {
  getFareForArea,
  loadVoyageSchedules,
  NEW_SCHEDULE_DEFAULTS,
  saveVoyageSchedules,
  VOYAGE_DAYS,
} from "../data/voyageSchedules";
import {
  DEFAULT_VESSELS,
  getVesselPassengerAreasStorageKey,
  getVesselById,
  loadVessels,
} from "../data/vesselStorage";

const STATUS_STYLES = {
  Scheduled: "text-blue-700 bg-blue-500/10 border-blue-500/20",
  Boarding: "text-amber-700 bg-amber-500/10 border-amber-500/20",
  Active: "text-emerald-700 bg-emerald-500/10 border-emerald-500/20",
  Completed: "text-slate-500 bg-slate-100 border-slate-200",
  Cancelled: "text-red-700 bg-red-500/10 border-red-500/20",
};

const loadPassengerAreas = (vesselId) => {
  try {
    const savedAreas =
      window.localStorage.getItem(
        getVesselPassengerAreasStorageKey(vesselId),
      ) ||
      (vesselId === "vessel-1" &&
        window.localStorage.getItem(BUNK_CONFIGURATION_STORAGE_KEY));
    const parsedAreas = savedAreas
      ? JSON.parse(savedAreas)
      : PASSENGER_BUNK_AREAS;
    if (!Array.isArray(parsedAreas)) {
      throw new Error("Saved passenger areas are not a list.");
    }
    return parsedAreas;
  } catch (error) {
    console.error("Unable to load passenger areas for voyage fares.", error);
    return PASSENGER_BUNK_AREAS;
  }
};
const formatDate = (value) =>
  new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const getStatus = (voyage, now) => {
  if (voyage.overrideStatus) return voyage.overrideStatus;
  const departure = new Date(voyage.departure).getTime();
  const arrival = new Date(voyage.arrival).getTime();
  const boarding = departure - 2 * 60 * 60 * 1000;
  if (now >= arrival) return "Completed";
  if (now >= departure) return "Active";
  if (now >= boarding) return "Boarding";
  return "Scheduled";
};

const createVoyages = (schedules, startDate) =>
  schedules.flatMap((schedule) => {
    if (schedule.status !== "Active") return [];
    const voyages = [];
    for (let offset = -1; offset <= 21; offset += 1) {
      const departureDate = new Date(startDate);
      departureDate.setHours(0, 0, 0, 0);
      departureDate.setDate(departureDate.getDate() + offset);
      if (!schedule.days.includes(departureDate.getDay())) continue;
      const [departureHour, departureMinute] = schedule.departureTime
        .split(":")
        .map(Number);
      departureDate.setHours(departureHour, departureMinute, 0, 0);
      const arrivalDate = new Date(departureDate);
      const [arrivalHour, arrivalMinute] = schedule.arrivalTime
        .split(":")
        .map(Number);
      arrivalDate.setDate(
        arrivalDate.getDate() + (arrivalHour <= departureHour ? 1 : 0),
      );
      arrivalDate.setHours(arrivalHour, arrivalMinute, 0, 0);
      voyages.push({
        id: `${schedule.id}-${departureDate.toISOString().slice(0, 10)}`,
        scheduleId: schedule.id,
        reference: `AUTO-${departureDate.toISOString().slice(0, 10).replaceAll("-", "")}-${schedule.id.slice(-1)}`,
        routeId: schedule.routeId,
        vesselId: schedule.vesselId,
        departure: departureDate.toISOString(),
        arrival: arrivalDate.toISOString(),
        overrideStatus: "",
      });
    }
    return voyages;
  });

export function Voyages({ currentUser = "Current user", canEdit = false }) {
  const [schedules, setSchedules] = useState(loadVoyageSchedules);
  const [vessels, setVessels] = useState(loadVessels);
  const [passengerAreas, setPassengerAreas] = useState(() =>
    loadPassengerAreas(NEW_SCHEDULE_DEFAULTS.vesselId),
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState(NEW_SCHEDULE_DEFAULTS);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [cancellationRecords, setCancellationRecords] = useState([]);
  const [voyageToCancel, setVoyageToCancel] = useState(null);
  const [cancellationPassword, setCancellationPassword] = useState("");
  const [cancellationError, setCancellationError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canEdit) return;
    try {
      saveVoyageSchedules(schedules);
    } catch (error) {
      console.error("Unable to save voyage schedules.", error);
    }
  }, [canEdit, schedules]);

  useEffect(() => {
    const passengerAreasStorageKey =
      getVesselPassengerAreasStorageKey(newSchedule.vesselId);
    const refreshPassengerAreas = (event) => {
      if (
        event.type === "storage" &&
        event.key !== passengerAreasStorageKey &&
        !(
          newSchedule.vesselId === "vessel-1" &&
          event.key === BUNK_CONFIGURATION_STORAGE_KEY
        )
      ) {
        return;
      }
      setPassengerAreas(loadPassengerAreas(newSchedule.vesselId));
    };
    window.addEventListener("storage", refreshPassengerAreas);
    window.addEventListener("passenger-bunks-updated", refreshPassengerAreas);
    return () => {
      window.removeEventListener("storage", refreshPassengerAreas);
      window.removeEventListener(
        "passenger-bunks-updated",
        refreshPassengerAreas,
      );
    };
  }, [newSchedule.vesselId]);

  useEffect(() => {
    const refreshVessels = (event) => {
      if (event.type === "storage" && event.key !== "deeparted-vessels") return;
      setVessels(loadVessels());
    };
    window.addEventListener("storage", refreshVessels);
    window.addEventListener("vessels-updated", refreshVessels);
    return () => {
      window.removeEventListener("storage", refreshVessels);
      window.removeEventListener("vessels-updated", refreshVessels);
    };
  }, []);

  const voyages = useMemo(
    () =>
      createVoyages(schedules, new Date(now)).map((voyage) => {
        const cancellation = cancellationRecords.find(
          (record) => record.voyageId === voyage.id,
        );
        return cancellation
          ? { ...voyage, overrideStatus: "Cancelled", cancellation }
          : voyage;
      }),
    [schedules, now, cancellationRecords],
  );
  const counts = useMemo(
    () => ({
      total: voyages.length,
      active: voyages.filter((voyage) =>
        ["Active", "Boarding"].includes(getStatus(voyage, now)),
      ).length,
      scheduled: voyages.filter(
        (voyage) => getStatus(voyage, now) === "Scheduled",
      ).length,
    }),
    [voyages, now],
  );
  const getVessel = (vesselId) =>
    vessels.find((vessel) => vessel.id === vesselId) ||
    getVesselById(vesselId) ||
    vessels[0] ||
    DEFAULT_VESSELS[0];
  const getRoute = (routeId) =>
    MOCK_ROUTES.find((route) => route.id === routeId) || MOCK_ROUTES[0];
  const updateField = (field, value) =>
    setNewSchedule((current) => ({ ...current, [field]: value }));

  const createSchedule = (event) => {
    event.preventDefault();
    if (!canEdit) return;
    if (!passengerAreas.length) {
      alert("Add a passenger bunk area in Vessel before configuring voyages.");
      return;
    }
    if (!newSchedule.days.length) {
      alert("Select at least one operating day.");
      return;
    }
    const hasMissingFare = passengerAreas.some(
      (area) => !getFareForArea({ fares: newSchedule.fares }, area.id),
    );
    if (hasMissingFare) {
      alert("Enter a ticket price greater than zero for every passenger area.");
      return;
    }
    const departureHour = Number(newSchedule.departureTime.split(":")[0]);
    const arrivalHour = Number(newSchedule.arrivalTime.split(":")[0]);
    const durationHours =
      arrivalHour <= departureHour
        ? arrivalHour + 24 - departureHour
        : arrivalHour - departureHour;
    if (editingScheduleId) {
      setSchedules((current) =>
        current.map((schedule) =>
          schedule.id === editingScheduleId
            ? { ...schedule, fares: newSchedule.fares }
            : schedule,
        ),
      );
    } else {
      setSchedules((current) => [
        {
        ...newSchedule,
        id: `schedule-${Date.now()}`,
        name: getRoute(newSchedule.routeId).name,
        durationHours,
        status: "Active",
        },
        ...current,
      ]);
    }
    setNewSchedule(NEW_SCHEDULE_DEFAULTS);
    setEditingScheduleId(null);
    setIsFormOpen(false);
  };

  const editScheduleFares = (schedule) => {
    if (!canEdit) return;
    setEditingScheduleId(schedule.id);
    setPassengerAreas(loadPassengerAreas(schedule.vesselId));
    setNewSchedule({
      ...schedule,
      fares: { ...schedule.fares },
    });
    setIsFormOpen(true);
  };

  const openNewScheduleForm = () => {
    if (!canEdit) return;
    setEditingScheduleId(null);
    setPassengerAreas(loadPassengerAreas(NEW_SCHEDULE_DEFAULTS.vesselId));
    setNewSchedule(NEW_SCHEDULE_DEFAULTS);
    setIsFormOpen(true);
  };

  const toggleSchedule = (scheduleId) =>
    canEdit && setSchedules((current) =>
      current.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              status: schedule.status === "Active" ? "Paused" : "Active",
            }
          : schedule,
      ),
    );
  const openCancellation = (voyage) => {
    if (!canEdit) return;
    setVoyageToCancel(voyage);
    setCancellationPassword("");
    setCancellationError("");
  };

  const closeCancellation = () => {
    setVoyageToCancel(null);
    setCancellationPassword("");
    setCancellationError("");
  };

  const confirmCancellation = (event) => {
    event.preventDefault();
    if (!canEdit) return;
    if (!cancellationPassword.trim()) {
      setCancellationError("Enter your password to record this cancellation.");
      return;
    }
    setCancellationRecords((current) => [
      ...current,
      {
        voyageId: voyageToCancel.id,
        cancelledBy: currentUser,
        cancelledAt: new Date().toISOString(),
      },
    ]);
    closeCancellation();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
            Operations / Automation
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-blue-600" /> Voyages
          </h2>
          <p className="text-sm text-slate-500 dark:text-github-muted mt-1">
            Schedules generate your upcoming sailings automatically. Edit an
            individual voyage only when operations need an exception.
          </p>
        </div>
        {canEdit && <button
          onClick={openNewScheduleForm}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Create Schedule
        </button>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Generated next 3 weeks",
            value: counts.total,
            icon: CalendarDays,
            tone: "text-blue-600 bg-blue-500/10",
          },
          {
            label: "Boarding or underway",
            value: counts.active,
            icon: Anchor,
            tone: "text-emerald-600 bg-emerald-500/10",
          },
          {
            label: "Scheduled",
            value: counts.scheduled,
            icon: Clock3,
            tone: "text-amber-600 bg-amber-500/10",
          },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border p-4 shadow-sm flex items-center gap-3"
          >
            <div className={`p-2.5 ${tone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {value}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-github-muted">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Recurring schedules
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure a route once and let the system produce its voyage
              instances.
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            {
              schedules.filter((schedule) => schedule.status === "Active")
                .length
            }{" "}
            active
          </span>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {schedules.map((schedule) => {
            const route = getRoute(schedule.routeId);
            const vessel = getVessel(schedule.vesselId);
            return (
              <article
                key={schedule.id}
                className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {schedule.name}
                      </h4>
                      <span
                        className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${schedule.status === "Active" ? "text-emerald-700 bg-emerald-500/10 border-emerald-500/20" : "text-slate-500 bg-slate-100 border-slate-200"}`}
                      >
                        {schedule.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {vessel.name} · {vessel.capacity} passenger capacity
                    </p>
                  </div>
                  {canEdit && <button
                    onClick={() => toggleSchedule(schedule.id)}
                    title={
                      schedule.status === "Active"
                        ? "Pause schedule"
                        : "Resume schedule"
                    }
                    className="p-2 text-slate-400 hover:text-blue-600"
                  >
                    {schedule.status === "Active" ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-600 dark:text-github-text">
                  <span className="font-semibold">
                    {route.originCode} {route.origin}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold">
                    {route.destinationCode} {route.destination}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {VOYAGE_DAYS.map((day) => (
                    <span
                      key={day.value}
                      className={`px-2 py-1 text-[10px] font-bold border ${schedule.days.includes(day.value) ? "text-blue-700 bg-blue-500/10 border-blue-500/20" : "text-slate-300 border-slate-100 dark:border-github-border"}`}
                    >
                      {day.label}
                    </span>
                  ))}
                  <span className="text-[11px] text-slate-500 ml-2">
                    Departs {schedule.departureTime} · {schedule.durationHours}h
                    trip
                  </span>
                </div>
                <div className="mt-4 border-t border-slate-100 dark:border-github-border pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Passenger fares
                    </p>
                    {canEdit && <button
                      type="button"
                      onClick={() => editScheduleFares(schedule)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      Set prices
                    </button>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {loadPassengerAreas(schedule.vesselId).map((area) => {
                      const fare = getFareForArea(schedule, area.id);
                      return (
                        <span
                          key={area.id}
                          className={`border px-2 py-1 text-[10px] font-semibold ${
                            fare
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}
                        >
                          {area.accommodation} · {area.label}:{" "}
                          {fare ? `PHP ${fare.toLocaleString()}` : "Not set"}
                        </span>
                      );
                    })}
                    {!passengerAreas.length && (
                      <span className="text-[11px] text-slate-400">
                        Add passenger areas in Vessel to configure ticket prices.
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            Upcoming generated voyages
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Status updates automatically from the departure and arrival times.
            Boarding opens two hours before departure.
          </p>
        </div>
        {voyages.map((voyage) => {
          const vessel = getVessel(voyage.vesselId);
          const route = getRoute(voyage.routeId);
          const status = getStatus(voyage, now);
          return (
            <article
              key={voyage.id}
              className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border shadow-sm p-5"
            >
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="p-3 bg-slate-100 dark:bg-github-panel text-blue-600 shrink-0">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {vessel.name}
                      </h4>
                      <span
                        className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${STATUS_STYLES[status]}`}
                      >
                        {status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Auto-generated
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {voyage.reference} · {route.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-600 dark:text-github-text">
                      <span className="font-semibold">{route.originCode}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-semibold">
                        {route.destinationCode}
                      </span>
                    </div>
                    {voyage.cancellation && (
                      <p className="text-[11px] text-red-600 mt-3">
                        Cancelled by {voyage.cancellation.cancelledBy} on{" "}
                        {formatDate(voyage.cancellation.cancelledAt)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs min-w-[300px]">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">
                      Departure
                    </p>
                    <p className="text-slate-700 dark:text-slate-200 mt-0.5">
                      {formatDate(voyage.departure)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">
                      Arrival
                    </p>
                    <p className="text-slate-700 dark:text-slate-200 mt-0.5">
                      {formatDate(voyage.arrival)}
                    </p>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1.5 text-slate-400 mt-1">
                    <Users className="w-3.5 h-3.5" /> Booking capacity will
                    connect here
                  </div>
                </div>
                {canEdit && <button
                  onClick={() => openCancellation(voyage)}
                  disabled={status === "Completed" || status === "Cancelled"}
                  className="self-start xl:self-center p-2 text-slate-400 hover:text-red-500 disabled:opacity-30"
                  title="Cancel this voyage"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>}
              </div>
            </article>
          );
        })}
      </section>

      {canEdit && voyageToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={confirmCancellation}
            className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border shadow-2xl w-full max-w-md p-6 space-y-5"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/10 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Cancel this voyage?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {voyageToCancel.reference} will be marked as cancelled. This
                  action will be recorded for audit purposes.
                </p>
              </div>
            </div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-github-text">
              Confirm your password
              <input
                autoFocus
                required
                type="password"
                value={cancellationPassword}
                onChange={(event) => {
                  setCancellationPassword(event.target.value);
                  setCancellationError("");
                }}
                placeholder="Enter your password"
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              Signed in as {currentUser}. Password verification is represented
              as a confirmation step in this prototype.
            </p>
            {cancellationError && (
              <p className="text-xs text-red-600">{cancellationError}</p>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-github-border pt-4">
              <button
                type="button"
                onClick={closeCancellation}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-github-text"
              >
                Keep Voyage
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 !text-white text-xs font-bold"
              >
                Confirm Cancellation
              </button>
            </div>
          </form>
        </div>
      )}

      {canEdit && isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={createSchedule}
            className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border shadow-2xl w-full max-w-xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-github-border pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {editingScheduleId
                    ? "Set Passenger Ticket Prices"
                    : "Create Recurring Schedule"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {editingScheduleId
                    ? "Set the fare for each passenger area configured in Vessel."
                    : "The system will generate the next 3 weeks of voyages automatically."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {!editingScheduleId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
                  Route
                  <select
                    value={newSchedule.routeId}
                    onChange={(event) =>
                      updateField("routeId", event.target.value)
                    }
                    className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                  >
                    {MOCK_ROUTES.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
                  Vessel
                  <select
                    value={newSchedule.vesselId}
                    onChange={(event) => {
                      updateField("vesselId", event.target.value);
                      setPassengerAreas(loadPassengerAreas(event.target.value));
                    }}
                    className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                  >
                    {vessels.map((vessel) => (
                      <option key={vessel.id} value={vessel.id}>
                        {vessel.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-github-text mb-2">
                    Operating days
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {VOYAGE_DAYS.map((day) => (
                      <label
                        key={day.value}
                        className={`cursor-pointer px-3 py-2 border text-xs font-bold ${newSchedule.days.includes(day.value) ? "text-blue-700 bg-blue-500/10 border-blue-500/30" : "text-slate-400 border-slate-200 dark:border-github-border"}`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={newSchedule.days.includes(day.value)}
                          onChange={() =>
                            updateField(
                              "days",
                              newSchedule.days.includes(day.value)
                                ? newSchedule.days.filter(
                                    (value) => value !== day.value,
                                  )
                                : [...newSchedule.days, day.value],
                            )
                          }
                        />
                        {day.label}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
                  Departure time
                  <input
                    required
                    type="time"
                    value={newSchedule.departureTime}
                    onChange={(event) =>
                      updateField("departureTime", event.target.value)
                    }
                    className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
                  Arrival time
                  <input
                    required
                    type="time"
                    value={newSchedule.arrivalTime}
                    onChange={(event) =>
                      updateField("arrivalTime", event.target.value)
                    }
                    className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                  />
                </label>
              </div>
            )}
            <section className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Ticket prices by passenger area
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Passenger classes and sections come from the Vessel deck plan.
                </p>
              </div>
              {passengerAreas.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {passengerAreas.map((area) => (
                    <label
                      key={area.id}
                      className="text-xs font-semibold text-slate-600 dark:text-github-text"
                    >
                      {area.accommodation} · {area.label}
                      <div className="mt-1 flex items-center border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel">
                        <span className="px-3 text-xs text-slate-400">PHP</span>
                        <input
                          required
                          min="0.01"
                          step="0.01"
                          type="number"
                          value={newSchedule.fares?.[area.id] ?? ""}
                          onChange={(event) =>
                            updateField("fares", {
                              ...newSchedule.fares,
                              [area.id]: event.target.value,
                            })
                          }
                          placeholder="Enter fare"
                          className="w-full border-0 bg-transparent px-2 py-2 text-sm text-slate-900 outline-none dark:text-white"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  No passenger areas are configured. Add a passenger bunk area
                  in Vessel before creating a schedule.
                </p>
              )}
            </section>
            <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-github-border pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-github-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />                 {editingScheduleId ? "Save Ticket Prices" : "Activate Schedule"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
