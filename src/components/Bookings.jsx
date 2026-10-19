import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Eye,
  FileText,
  History,
  Plus,
  Printer,
  Ticket,
  X,
} from "lucide-react";
import {
  BUNK_CONFIGURATION_STORAGE_KEY,
  MOCK_ROUTES,
  PASSENGER_BUNK_AREAS,
} from "../data/mockData";
import {
  VOYAGE_SCHEDULES_STORAGE_KEY,
  getFareForArea,
  loadVoyageSchedules,
} from "../data/voyageSchedules";
import { APP_ROUTE_PATHS } from "../config/appConfig";
import {
  DEFAULT_VESSELS,
  getVesselPassengerAreasStorageKey,
  getVesselById,
  loadVessels,
} from "../data/vesselStorage";
import { renderPassengerTicket } from "../data/passengerTicketTemplate";
import {
  loadTodayBookings,
  saveTodayBookings,
} from "../data/bookingStorage";

const STATUS_STYLES = {
  Held: "text-amber-700 bg-amber-500/10 border-amber-500/20",
  Confirmed: "text-blue-700 bg-blue-500/10 border-blue-500/20",
  "Ticket Issued": "text-emerald-700 bg-emerald-500/10 border-emerald-500/20",
};

const formatDate = (value) =>
  new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const loadBunkAreas = (vesselId) => {
  try {
    const savedAreas =
      window.localStorage.getItem(
        getVesselPassengerAreasStorageKey(vesselId),
      ) ||
      (vesselId === "vessel-1" &&
        window.localStorage.getItem(BUNK_CONFIGURATION_STORAGE_KEY));
    return savedAreas
      ? JSON.parse(savedAreas)
      : PASSENGER_BUNK_AREAS;
  } catch (error) {
    console.error("Unable to load the selected vessel's passenger areas.", error);
    return PASSENGER_BUNK_AREAS;
  }
};

const createVoyages = (schedules) =>
  schedules.flatMap((schedule) => {
    if (schedule.status !== "Active") return [];
    const result = [];
    for (let offset = 0; offset < 21; offset += 1) {
      const departure = new Date();
      departure.setHours(0, 0, 0, 0);
      departure.setDate(departure.getDate() + offset);
      if (!schedule.days.includes(departure.getDay())) continue;
      const [departureHour, departureMinute] = schedule.departureTime
        .split(":")
        .map(Number);
      departure.setHours(departureHour, departureMinute, 0, 0);
      const arrival = new Date(departure);
      const [arrivalHour, arrivalMinute] = schedule.arrivalTime
        .split(":")
        .map(Number);
      arrival.setDate(
        arrival.getDate() + (arrivalHour <= departureHour ? 1 : 0),
      );
      arrival.setHours(arrivalHour, arrivalMinute, 0, 0);
      result.push({
        id: `${schedule.id}-${departure.toISOString().slice(0, 10)}`,
        scheduleId: schedule.id,
        departure: departure.toISOString(),
        arrival: arrival.toISOString(),
        routeId: schedule.routeId,
        vesselId: schedule.vesselId,
      });
    }
    return result;
  });

export function Bookings({
  currentUser = "Current user",
}) {
  const [schedules, setSchedules] = useState(loadVoyageSchedules);
  const [vessels, setVessels] = useState(loadVessels);
  const voyages = useMemo(() => createVoyages(schedules), [schedules]);
  const [bookings, setBookings] = useState(loadTodayBookings);
  const [bookingPage, setBookingPage] = useState("create");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBedLayoutOpen, setIsBedLayoutOpen] = useState(false);
  const [bookingPreview, setBookingPreview] = useState(null);
  const [bunkAreas, setBunkAreas] = useState(() =>
    loadBunkAreas(voyages[0]?.vesselId),
  );
  const accommodations = bunkAreas.map((area) => ({
    value: area.id,
    label: area.label,
    description: area.accommodation,
  }));
  const bunks = bunkAreas.flatMap((area) =>
    area.beds.map((bed) => ({
      ...bed,
      areaId: area.id,
      accommodation: area.accommodation,
      areaLabel: area.label,
    })),
  );
  const emptyBooking = {
    voyageId: "",
    passengerName: "",
    contact: "",
    quantity: 1,
    paymentMethod: "Cash",
    areaId: accommodations[0]?.value || "",
    bunkPreference: "Random",
    bunkId: "",
  };
  const [newBooking, setNewBooking] = useState(() => ({
    ...emptyBooking,
    voyageId: voyages[0]?.id || "",
  }));
  const selectedVoyage = voyages.find(
    (voyage) => voyage.id === newBooking.voyageId,
  );

  useEffect(() => {
    try {
      saveTodayBookings(bookings);
    } catch (error) {
      console.error("Unable to save booking records.", error);
    }
  }, [bookings]);

  useEffect(() => {
    const refreshTodayBookings = (event) => {
      if (!event.key?.startsWith("deeparted-bookings-day:")) return;
      try {
        setBookings(loadTodayBookings());
      } catch (error) {
        console.error("Unable to refresh today's bookings.", error);
      }
    };
    window.addEventListener("storage", refreshTodayBookings);
    return () => window.removeEventListener("storage", refreshTodayBookings);
  }, []);

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

  useEffect(() => {
    const refreshBunks = (event) => {
      if (
        event.type === "storage" &&
        event.key !==
          getVesselPassengerAreasStorageKey(selectedVoyage?.vesselId) &&
        !(
          selectedVoyage?.vesselId === "vessel-1" &&
          event.key === BUNK_CONFIGURATION_STORAGE_KEY
        )
      ) {
        return;
      }
      setBunkAreas(loadBunkAreas(selectedVoyage?.vesselId));
    };
    window.addEventListener("storage", refreshBunks);
    window.addEventListener("passenger-bunks-updated", refreshBunks);
    return () => {
      window.removeEventListener("storage", refreshBunks);
      window.removeEventListener("passenger-bunks-updated", refreshBunks);
    };
  }, [selectedVoyage?.vesselId]);

  useEffect(() => {
    const refreshSchedules = (event) => {
      if (
        event.type === "storage" &&
        event.key !== VOYAGE_SCHEDULES_STORAGE_KEY
      ) {
        return;
      }
      setSchedules(loadVoyageSchedules());
    };
    window.addEventListener("storage", refreshSchedules);
    window.addEventListener("voyage-schedules-updated", refreshSchedules);
    return () => {
      window.removeEventListener("storage", refreshSchedules);
      window.removeEventListener("voyage-schedules-updated", refreshSchedules);
    };
  }, []);

  const getRoute = (routeId) =>
    MOCK_ROUTES.find((route) => route.id === routeId) || MOCK_ROUTES[0];
  const getVessel = (vesselId) =>
    vessels.find((vessel) => vessel.id === vesselId) ||
    getVesselById(vesselId) ||
    vessels[0] ||
    DEFAULT_VESSELS[0];
  const getVoyage = (voyageId) =>
    voyages.find((voyage) => voyage.id === voyageId);
  const getBookingVoyage = (booking) => {
    const currentVoyage = getVoyage(booking.voyageId);
    if (currentVoyage) return currentVoyage;
    if (booking.voyageSnapshot) return booking.voyageSnapshot;

    const schedule = schedules.find((item) =>
      booking.voyageId.startsWith(`${item.id}-`),
    );
    if (!schedule) return null;
    const departureDate = booking.voyageId.slice(schedule.id.length + 1);
    const departure = new Date(`${departureDate}T${schedule.departureTime}:00`);
    if (Number.isNaN(departure.getTime())) return null;
    const arrival = new Date(departure);
    const [arrivalHour, arrivalMinute] = schedule.arrivalTime
      .split(":")
      .map(Number);
    const [departureHour] = schedule.departureTime.split(":").map(Number);
    arrival.setDate(arrival.getDate() + (arrivalHour <= departureHour ? 1 : 0));
    arrival.setHours(arrivalHour, arrivalMinute, 0, 0);
    return {
      id: booking.voyageId,
      scheduleId: schedule.id,
      departure: departure.toISOString(),
      arrival: arrival.toISOString(),
      routeId: schedule.routeId,
      vesselId: schedule.vesselId,
    };
  };
  const getTicketHtml = (booking) => {
    const voyage = getBookingVoyage(booking);
    const route = getRoute(voyage.routeId);
    const vessel = getVessel(voyage.vesselId);
    return renderPassengerTicket({
      booking_reference: booking.reference,
      passenger_name: booking.passengerName,
      contact_number: booking.contact,
      route_name: route.name,
      departure_date: formatDate(voyage.departure),
      section_name: booking.section,
      bed_number: booking.bunkLabel,
      bed_preference: booking.bunkPreference,
      ticket_price: `PHP ${Number(booking.amount).toLocaleString()}`,
      payment_method: booking.paymentMethod,
      vessel_name: vessel.name,
      payment_status:
        booking.status === "Ticket Issued"
          ? "PAID - TICKET ISSUED"
          : "Held - awaiting payment",
    });
  };
  const printTicket = (booking) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Allow pop-ups to print the ticket.");
      return;
    }
    printWindow.document.write(
      `<!doctype html><html><head><title>${booking.ticketNumber || booking.reference}</title><style>@page{size:A4;margin:16mm}body{margin:0;font-family:Arial,sans-serif}</style></head><body>${getTicketHtml(booking)}</body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  const updateField = (field, value) =>
    setNewBooking((current) => ({ ...current, [field]: value }));
  const selectedSchedule = schedules.find(
    (schedule) => schedule.id === selectedVoyage?.scheduleId,
  );
  const ticketFare = getFareForArea(selectedSchedule, newBooking.areaId);
  const bookingTotal = ticketFare
    ? ticketFare * Number(newBooking.quantity || 0)
    : null;
  const getSold = (voyageId) =>
    bookings
      .filter(
        (booking) =>
          booking.voyageId === voyageId && booking.status !== "Cancelled",
      )
      .reduce((total, booking) => total + booking.quantity, 0);
  const occupiedBunkIds = bookings
    .filter(
      (booking) =>
        booking.voyageId === newBooking.voyageId &&
        booking.status !== "Cancelled" &&
        booking.bunkId,
    )
    .map((booking) => booking.bunkId);
  const availableBunks = bunks.filter(
    (bunk) =>
      bunk.areaId === newBooking.areaId && !occupiedBunkIds.includes(bunk.id),
  );
  const matchingBunks = ["Random", "Manual"].includes(newBooking.bunkPreference)
    ? availableBunks
    : availableBunks.filter((bunk) => bunk.level === newBooking.bunkPreference);
  const bookingCounts = useMemo(
    () =>
      bookings.reduce(
        (counts, booking) => {
          counts[booking.status] = (counts[booking.status] || 0) + 1;
          return counts;
        },
        { Held: 0, Confirmed: 0, "Ticket Issued": 0 },
      ),
    [bookings],
  );
  const workBookings = useMemo(
    () => bookings.filter((booking) => ["Held", "Confirmed"].includes(booking.status)),
    [bookings],
  );
  const issuedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "Ticket Issued"),
    [bookings],
  );
  const createBooking = (event) => {
    event.preventDefault();
    if (!selectedVoyage || !newBooking.passengerName.trim()) return;
    if (!Number.isInteger(Number(newBooking.quantity)) || Number(newBooking.quantity) < 1) {
      alert("Enter at least one passenger.");
      return;
    }
    if (!ticketFare) {
      alert("Set a ticket price for this passenger area in Voyages first.");
      return;
    }
    if (
      getSold(selectedVoyage.id) + Number(newBooking.quantity) >
      getVessel(selectedVoyage.vesselId).capacity
    ) {
      alert("There is not enough remaining capacity on this voyage.");
      return;
    }
    const preferredBunks =
      newBooking.bunkPreference === "Random" ||
      newBooking.bunkPreference === "Manual"
        ? availableBunks
        : availableBunks.filter(
            (bunk) => bunk.level === newBooking.bunkPreference,
          );
    const assignedBunk =
      newBooking.bunkPreference === "Manual"
        ? preferredBunks.find((bunk) => bunk.id === newBooking.bunkId)
        : preferredBunks[0];
    if (!assignedBunk) {
      alert(
        newBooking.bunkPreference === "Manual"
          ? "Choose a bed from the layout."
          : "No beds are available in this section.",
      );
      return;
    }
    // This timestamp is generated only after the user submits the hold form.
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    const booking = {
      ...newBooking,
      quantity: Number(newBooking.quantity),
      unitPrice: ticketFare,
      amount: bookingTotal,
      voyageSnapshot: selectedVoyage,
      createdAt: new Date(timestamp).toISOString(),
      bunkId: assignedBunk.id,
      bunkLabel: assignedBunk.label,
      accommodation: assignedBunk.accommodation,
      section: assignedBunk.areaLabel,
      id: `booking-${timestamp}`,
      reference: `BKG-${timestamp.toString().slice(-6)}`,
      status: "Held",
      createdBy: currentUser,
      heldUntil: new Date(timestamp + 15 * 60 * 1000).toISOString(),
      ticketNumber: "",
    };
    setBookings((current) => [booking, ...current]);
    setNewBooking({
      ...emptyBooking,
      voyageId: voyages[0]?.id || "",
    });
    setIsFormOpen(false);
  };

  const recordPayment = (bookingId) =>
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: "Confirmed",
              paymentStatus: "Paid",
              paidAt: new Date().toISOString(),
              paidBy: currentUser,
            }
          : booking,
      ),
    );
  const issueTicket = (booking) => {
    if (booking.status !== "Confirmed") return null;
    // Generate ticket identifiers only when the operator issues the ticket.
    // eslint-disable-next-line react-hooks/purity
    const issuedAt = Date.now();
    const issuedBooking = {
      ...booking,
      status: "Ticket Issued",
      ticketNumber: `TKT-${issuedAt.toString().slice(-8)}`,
      issuedAt: new Date(issuedAt).toISOString(),
      issuedBy: currentUser,
    };
    setBookings((current) =>
      current.map((item) =>
        item.id === booking.id ? issuedBooking : item,
      ),
    );
    return issuedBooking;
  };
  const issueAndPrintTicket = (booking) => {
    const issuedBooking = issueTicket(booking);
    if (issuedBooking) printTicket(issuedBooking);
  };
  const issuedTicketActions = (booking) =>
    booking.status === "Ticket Issued" && (
      <>
        <button
          onClick={() => setBookingPreview(booking)}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-800 !text-white text-xs font-bold flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" /> View Ticket
        </button>
        <button
          onClick={() => printTicket(booking)}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" /> Print Ticket
        </button>
      </>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
            Commercial / Reservations
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" /> Bookings
          </h2>
          <p className="text-sm text-slate-500 dark:text-github-muted mt-1">
            Reserve capacity first, record payment second, and issue the ticket
            only after confirmation.
          </p>
        </div>
        <a
          href={APP_ROUTE_PATHS.bookingRecords}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-github-border dark:bg-github-panel dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <History className="h-4 w-4" /> Search Past Records
        </a>
      </div>

      <nav
        aria-label="Booking pages"
        className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-github-border"
      >
        {[
          ["create", "Today's Workflow"],
          [
            "tickets",
            `Issued Tickets (${bookingCounts["Ticket Issued"]})`,
          ],
        ].map(([page, label]) => (
          <button
            key={page}
            type="button"
            onClick={() => setBookingPage(page)}
            aria-current={bookingPage === page ? "page" : undefined}
            className={`border-b-2 px-3 py-2 text-xs font-bold transition-colors ${
              bookingPage === page
                ? "border-teal-600 text-teal-700 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-github-muted dark:hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Held", "Confirmed", "Ticket Issued"].map((status) => (
          <div
            key={status}
            className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border p-4"
          >
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {bookingCounts[status]}
            </p>
            <p className="text-[11px] text-slate-500">
              {status} bookings today
            </p>
          </div>
        ))}
      </div>

      {bookingPage === "create" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Create and complete bookings
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-github-muted">
                Hold capacity, record payment here, then issue and print the ticket.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Hold Capacity
            </button>
          </div>

          {workBookings.length === 0 ? (
            <div className="border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-github-border dark:bg-github-panel dark:text-github-muted">
              No bookings need payment or ticketing. Hold capacity to start a new booking.
            </div>
          ) : (
            <div className="space-y-3">
              {workBookings.map((booking) => {
                  const voyage = getBookingVoyage(booking);
                  const route = getRoute(voyage.routeId);
                  return (
                    <article
                      key={booking.id}
                      className="flex flex-col justify-between gap-4 border border-slate-200 bg-white p-4 dark:border-github-border dark:bg-github-panel sm:flex-row sm:items-center"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            {booking.passengerName}
                          </h4>
                          <span
                            className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[booking.status]}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-github-muted">
                          {booking.reference} · {route.name} · {formatDate(voyage.departure)}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          PHP {Number(booking.amount).toLocaleString()} · {booking.paymentMethod}
                        </p>
                        {booking.status === "Confirmed" && (
                          <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            Payment recorded. Issue the ticket to print it or find it in Issued Tickets.
                          </p>
                        )}
                      </div>
                      {booking.status === "Held" ? (
                        <button
                          type="button"
                          onClick={() => recordPayment(booking.id)}
                          className="shrink-0 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 !text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Record Payment
                        </button>
                      ) : (
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => issueTicket(booking)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" /> Issue Ticket
                          </button>
                          <button
                            type="button"
                            onClick={() => issueAndPrintTicket(booking)}
                            className="px-3 py-2 bg-teal-700 hover:bg-teal-800 !text-white text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" /> Issue &amp; Print
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
            </div>
          )}
        </section>
      )}

      {bookingPage === "create" && (
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Upcoming voyage capacity
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bookings reserve seats against one specific voyage.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {voyages.slice(0, 8).map((voyage) => {
            const route = getRoute(voyage.routeId);
            const vessel = getVessel(voyage.vesselId);
            const sold = getSold(voyage.id);
            return (
              <article
                key={voyage.id}
                className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {route.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatDate(voyage.departure)} · {vessel.name}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-500/10 px-2 py-1">
                    {vessel.capacity - sold} available
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-slate-600 dark:text-github-text">
                  <span className="font-semibold">{route.originCode}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold">{route.destinationCode}</span>
                  <span className="ml-auto text-slate-400">
                    {sold} reserved
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      )}

      {bookingPage === "tickets" && (
        <section className="space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Issued tickets
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              View or print tickets that have already been issued.
            </p>
          </div>
          <div className="space-y-2">
            {issuedBookings.length === 0 ? (
              <div className="border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-github-border dark:bg-github-panel dark:text-github-muted">
                No tickets have been issued yet.
              </div>
            ) : issuedBookings.map((booking) => (
                <div
                  key={`issued-${booking.id}`}
                  className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {booking.ticketNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {booking.passengerName} · {booking.reference} · Issued by{" "}
                      {booking.issuedBy}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {getRoute(getBookingVoyage(booking).routeId).name} ·{" "}
                      {formatDate(getBookingVoyage(booking).departure)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {issuedTicketActions(booking)}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={createBooking}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-slate-200 bg-white p-6 space-y-5 shadow-2xl dark:border-github-border dark:bg-github-panel"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-github-border pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Create Booking
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Capacity is held for 15 minutes while payment is completed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-slate-600 dark:text-github-text sm:col-span-2">
                Voyage
                <select
                  required
                  value={newBooking.voyageId}
                  onChange={(event) => {
                    const voyageId = event.target.value;
                    const nextVoyage = voyages.find(
                      (voyage) => voyage.id === voyageId,
                    );
                    const areas = loadBunkAreas(nextVoyage?.vesselId);
                    setBunkAreas(areas);
                    setNewBooking((current) => ({
                      ...current,
                      voyageId,
                      areaId: areas.some(
                        (area) => area.id === current.areaId,
                      )
                        ? current.areaId
                        : areas[0]?.id || "",
                      bunkId: "",
                    }));
                  }}
                  className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                >
                  {voyages.map((voyage) => (
                    <option key={voyage.id} value={voyage.id}>
                      {getRoute(voyage.routeId).name} ·{" "}
                      {formatDate(voyage.departure)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-github-text sm:col-span-2">
                Passenger name
                <input
                  required
                  value={newBooking.passengerName}
                  onChange={(event) =>
                    updateField("passengerName", event.target.value)
                  }
                  placeholder="Full passenger name"
                  className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                />
              </label>
              <div className="sm:col-span-2 border border-slate-200 dark:border-github-border p-4 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Accommodation section
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Choose the configured passenger bunk area. The system
                    assigns a bed automatically.
                  </p>
                </div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-github-text">
                  Section
                  <select
                    value={newBooking.areaId}
                    onChange={(event) => {
                      updateField("areaId", event.target.value);
                      updateField("bunkId", "");
                    }}
                    className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                  >
                    {accommodations.map((accommodation) => (
                      <option
                        key={accommodation.value}
                        value={accommodation.value}
                      >
                        {accommodation.description} · {accommodation.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-github-text col-span-2">
                    Bed preference
                    <select
                      value={newBooking.bunkPreference}
                      onChange={(event) => {
                        updateField("bunkPreference", event.target.value);
                        updateField("bunkId", "");
                      }}
                      className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                    >
                      <option value="Random">Random</option>
                      <option value="Lower">Lower</option>
                      <option value="Top">Top</option>
                      <option value="Manual">Manual selection</option>
                    </select>
                  </label>
                  <div className="flex items-end text-[11px] text-slate-500 pb-2">
                    {matchingBunks.length} available
                  </div>
                </div>
                {newBooking.bunkPreference === "Manual" ? (
                  <div className="flex items-center justify-between gap-3 border border-slate-200 dark:border-github-border p-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Selected bed
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {newBooking.bunkId
                          ? bunks.find((bunk) => bunk.id === newBooking.bunkId)
                              ?.label || "Bed selected"
                          : "None selected"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBedLayoutOpen(true)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold"
                    >
                      Open bed layout
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    A bed will be assigned automatically when capacity is held.
                  </p>
                )}
              </div>
              <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
                Contact number
                <input
                  required
                  value={newBooking.contact}
                  onChange={(event) =>
                    updateField("contact", event.target.value)
                  }
                  placeholder="09xx xxx xxxx"
                  className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
                Passengers
                <input
                  required
                  min="1"
                  type="number"
                  value={newBooking.quantity}
                  onChange={(event) =>
                    updateField("quantity", Number(event.target.value))
                  }
                  className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
                Payment method
                <select
                  value={newBooking.paymentMethod}
                  onChange={(event) =>
                    updateField("paymentMethod", event.target.value)
                  }
                  className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-panel text-slate-900 dark:text-white"
                >
                  <option>Cash</option>
                  <option>Bank transfer</option>
                  <option>Card</option>
                  <option>Online payment</option>
                </select>
              </label>
              <div className="sm:col-span-2 border border-blue-200 bg-blue-50 p-3 dark:border-github-border dark:bg-github-raised">
                {ticketFare ? (
                  <>
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                      Ticket fare: PHP {ticketFare.toLocaleString()} per
                      passenger
                    </p>
                    <p className="mt-1 text-[11px] text-blue-800 dark:text-blue-300">
                      {newBooking.quantity} passenger
                      {Number(newBooking.quantity) === 1 ? "" : "s"} · Total
                      payment: PHP {bookingTotal.toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                    No price is set for this passenger area on the selected
                    voyage. Set it in Voyages before holding capacity.
                  </p>
                )}
              </div>
            </div>
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
                disabled={!ticketFare || !selectedVoyage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Hold Capacity
              </button>
            </div>
          </form>
        </div>
      )}
      {isBedLayoutOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border shadow-2xl w-[95vw] h-[90vh] p-6 flex flex-col space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-github-border pb-3 shrink-0">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Choose a bed
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select a position in{" "}
                  {bunkAreas.find((area) => area.id === newBooking.areaId)
                    ?.label || "this section"}
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBedLayoutOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto border-2 border-slate-300 dark:border-github-border bg-slate-950 relative shadow-inner">
              <div className="w-[1400px] h-[900px] relative select-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />
                {availableBunks.map((bunk) => {
                  const isVertical = bunk.isVertical;
                  const isSelected = newBooking.bunkId === bunk.id;
                  return (
                    <button
                      type="button"
                      key={bunk.id}
                      title={`${bunk.label} · ${bunk.level}`}
                      aria-pressed={isSelected}
                      onClick={() => updateField("bunkId", bunk.id)}
                      style={{
                        left: `${bunk.x}px`,
                        top: `${bunk.y}px`,
                        width: isVertical ? "40px" : "60px",
                        height: isVertical ? "60px" : "40px",
                      }}
                      className={`absolute border box-border flex ${isVertical ? "flex-col justify-between py-1 px-1" : "flex-row justify-between px-1.5 items-center"} cursor-pointer shadow-sm transition-shadow z-10 ${isSelected ? "ring-4 ring-amber-300 border-white z-20 shadow-lg scale-110" : ""} ${bunk.level === "Top" ? "bg-sky-950/90 border-sky-400 text-sky-200" : "bg-emerald-950/90 border-emerald-400 text-emerald-200"}`}
                    >
                      <span className="leading-none text-left">
                        <span className="block text-[10px] font-extrabold text-white">
                          {bunk.label}
                        </span>
                        <span className="block text-[8px] opacity-80 mt-0.5">
                          {bunk.level[0]}L
                        </span>
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 shrink-0">
              <p
                className={`text-xs font-semibold ${newBooking.bunkId ? "text-emerald-600" : "text-slate-500"}`}
              >
                {newBooking.bunkId
                  ? `Bed ${bunks.find((bunk) => bunk.id === newBooking.bunkId)?.label} selected`
                  : "Select a bed to continue"}
              </p>
              <button
                type="button"
                onClick={() => setIsBedLayoutOpen(false)}
                disabled={!newBooking.bunkId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold disabled:opacity-40"
              >
                Confirm bed
              </button>
            </div>
          </div>
        </div>
      )}
      {bookingPreview && (
        <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-github-panel border border-slate-200 dark:border-github-border shadow-2xl w-full max-w-2xl p-6 space-y-5">
            <div className="flex items-start gap-3 border-b border-slate-200 dark:border-github-border pb-4">
              <div className="p-2 bg-blue-500/10 text-blue-600">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Ticket preview
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  This preview uses the Passenger Ticket & Boarding Pass report
                  from Reports.
                </p>
              </div>
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: getTicketHtml(bookingPreview),
              }}
            />
            <div className="flex justify-end gap-2">
              {bookingPreview.status === "Ticket Issued" && (
                <button
                  type="button"
                  onClick={() => printTicket(bookingPreview)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 !text-white text-xs font-bold"
                >
                  Print Ticket
                </button>
              )}
              <button
                type="button"
                onClick={() => setBookingPreview(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
