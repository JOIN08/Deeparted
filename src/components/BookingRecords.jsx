import { useState } from "react";
import { Search } from "lucide-react";
import { searchPastBookings } from "../data/bookingStorage";

const RESULTS_PER_PAGE = 50;

const formatDate = (value) =>
  new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export function BookingRecords() {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");

  const search = (event) => {
    event.preventDefault();
    setError("");
    try {
      const result = searchPastBookings({ query, fromDate, toDate });
      setResults(result);
      setPage(0);
    } catch (searchError) {
      console.error("Unable to search past booking records.", searchError);
      setResults(null);
      setError("Past bookings could not be loaded. Check browser storage and try again.");
    }
  };

  const currentResults = results?.matches.slice(
    page * RESULTS_PER_PAGE,
    (page + 1) * RESULTS_PER_PAGE,
  ) || [];
  const pageCount = results
    ? Math.max(1, Math.ceil(results.matches.length / RESULTS_PER_PAGE))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <a
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100"
        >
          Back to bookings
        </a>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
          Commercial / Reservations
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          Past booking records
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-github-muted">
          Search historical reservations by passenger, booking reference, contact, or ticket number.
        </p>
      </div>

      <form
        onSubmit={search}
        className="grid grid-cols-1 items-end gap-3 border border-slate-200 bg-white p-4 dark:border-github-border dark:bg-github-panel md:grid-cols-[minmax(220px,1fr)_180px_180px_auto]"
      >
        <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
          Search records
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, reference, contact, ticket"
            className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-github-border dark:bg-github-panel dark:text-white"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
          From
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-github-border dark:bg-github-panel dark:text-white"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-github-text">
          To
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-github-border dark:bg-github-panel dark:text-white"
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800"
        >
          <Search className="h-4 w-4" />
          Search past records
        </button>
      </form>

      {error && (
        <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {results && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white">
              {results.total.toLocaleString()} matching record{results.total === 1 ? "" : "s"}
            </h3>
            {results.total > results.matches.length && (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Showing the newest 500. Narrow the date range to see more.
              </p>
            )}
          </div>

          {currentResults.length === 0 ? (
            <div className="border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-github-border dark:bg-github-panel dark:text-github-muted">
              No past bookings match those search details.
            </div>
          ) : (
            currentResults.map((booking) => (
              <article
                key={booking.id}
                className="border border-slate-200 bg-white p-4 dark:border-github-border dark:bg-github-panel"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {booking.passengerName}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-github-muted">
                      {booking.reference} · {booking.contact}
                    </p>
                  </div>
                  <span className="border border-slate-200 px-2 py-1 text-[10px] font-bold uppercase text-slate-600 dark:border-github-border dark:text-github-text">
                    {booking.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 dark:text-github-text sm:grid-cols-2">
                  <p>Created {formatDate(booking.createdAt || booking.heldUntil)}</p>
                  <p>Amount PHP {Number(booking.amount).toLocaleString()} · {booking.paymentMethod}</p>
                  {booking.ticketNumber && <p>Ticket {booking.ticketNumber}</p>}
                  {booking.paidAt && <p>Paid {formatDate(booking.paidAt)} · {booking.paidBy}</p>}
                  {booking.voyageSnapshot?.departure && (
                    <p>Departure {formatDate(booking.voyageSnapshot.departure)}</p>
                  )}
                </div>
              </article>
            ))
          )}

          {pageCount > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((current) => current - 1)}
                className="border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40 dark:border-github-border dark:text-github-text"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500">
                Page {page + 1} of {pageCount}
              </span>
              <button
                type="button"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((current) => current + 1)}
                className="border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40 dark:border-github-border dark:text-github-text"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
