import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, CreditCard, FileText, Plus, Search, Ticket, X } from 'lucide-react';
import { BUNK_CONFIGURATION_STORAGE_KEY, MOCK_ROUTES, PASSENGER_BUNK_AREAS } from '../data/mockData';

const VESSELS = [
  { id: 'vessel-1', name: 'MV Trans-Asia 12', capacity: 420 },
  { id: 'vessel-2', name: 'MV Cebu Star', capacity: 280 },
];

const SCHEDULES = [
  { id: 'schedule-1', routeId: 'route-1', vesselId: 'vessel-1', days: [1, 3, 5], departureTime: '18:30', arrivalTime: '11:00' },
  { id: 'schedule-2', routeId: 'route-2', vesselId: 'vessel-2', days: [2, 4], departureTime: '08:00', arrivalTime: '22:00' },
];

const STATUS_STYLES = {
  Held: 'text-amber-700 bg-amber-500/10 border-amber-500/20',
  Confirmed: 'text-blue-700 bg-blue-500/10 border-blue-500/20',
  'Ticket Issued': 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20',
};

const formatDate = (value) => new Date(value).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

const loadBunkAreas = () => {
  try {
    const savedAreas = window.localStorage.getItem(BUNK_CONFIGURATION_STORAGE_KEY);
    return savedAreas ? JSON.parse(savedAreas) : PASSENGER_BUNK_AREAS;
  } catch {
    return PASSENGER_BUNK_AREAS;
  }
};

const createVoyages = () => SCHEDULES.flatMap((schedule) => {
  const result = [];
  for (let offset = 0; offset < 21; offset += 1) {
    const departure = new Date();
    departure.setHours(0, 0, 0, 0);
    departure.setDate(departure.getDate() + offset);
    if (!schedule.days.includes(departure.getDay())) continue;
    const [departureHour, departureMinute] = schedule.departureTime.split(':').map(Number);
    departure.setHours(departureHour, departureMinute, 0, 0);
    const arrival = new Date(departure);
    const [arrivalHour, arrivalMinute] = schedule.arrivalTime.split(':').map(Number);
    arrival.setDate(arrival.getDate() + (arrivalHour <= departureHour ? 1 : 0));
    arrival.setHours(arrivalHour, arrivalMinute, 0, 0);
    result.push({ id: `${schedule.id}-${departure.toISOString().slice(0, 10)}`, scheduleId: schedule.id, departure: departure.toISOString(), arrival: arrival.toISOString(), routeId: schedule.routeId, vesselId: schedule.vesselId });
  }
  return result;
});

export function Bookings({ currentUser = 'Current user' }) {
  const voyages = useMemo(() => createVoyages(), []);
  const [bookings, setBookings] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBedLayoutOpen, setIsBedLayoutOpen] = useState(false);
  const [bookingPreview, setBookingPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bunkAreas, setBunkAreas] = useState(loadBunkAreas);
  const accommodations = bunkAreas.map((area) => ({ value: area.id, label: area.label, description: area.accommodation }));
  const bunks = bunkAreas.flatMap((area) => area.beds.map((bed) => ({ ...bed, areaId: area.id, accommodation: area.accommodation, areaLabel: area.label })));
  const emptyBooking = { voyageId: '', passengerName: '', contact: '', quantity: 1, paymentMethod: 'Cash', amount: '1500', areaId: accommodations[0]?.value || '', bunkPreference: 'Random', bunkId: '' };
  const [newBooking, setNewBooking] = useState(() => ({ ...emptyBooking, voyageId: voyages[0]?.id || '' }));

  useEffect(() => {
    const refreshBunks = () => setBunkAreas(loadBunkAreas());
    window.addEventListener('storage', refreshBunks);
    window.addEventListener('passenger-bunks-updated', refreshBunks);
    return () => {
      window.removeEventListener('storage', refreshBunks);
      window.removeEventListener('passenger-bunks-updated', refreshBunks);
    };
  }, []);

  const getRoute = (routeId) => MOCK_ROUTES.find((route) => route.id === routeId) || MOCK_ROUTES[0];
  const getVessel = (vesselId) => VESSELS.find((vessel) => vessel.id === vesselId) || VESSELS[0];
  const getVoyage = (voyageId) => voyages.find((voyage) => voyage.id === voyageId);
  const updateField = (field, value) => setNewBooking((current) => ({ ...current, [field]: value }));
  const selectedVoyage = getVoyage(newBooking.voyageId);
  const getSold = (voyageId) => bookings.filter((booking) => booking.voyageId === voyageId && booking.status !== 'Cancelled').reduce((total, booking) => total + booking.quantity, 0);
  const occupiedBunkIds = bookings.filter((booking) => booking.voyageId === newBooking.voyageId && booking.status !== 'Cancelled' && booking.bunkId).map((booking) => booking.bunkId);
  const availableBunks = bunks.filter((bunk) => bunk.areaId === newBooking.areaId && !occupiedBunkIds.includes(bunk.id));
  const matchingBunks = ['Random', 'Manual'].includes(newBooking.bunkPreference) ? availableBunks : availableBunks.filter((bunk) => bunk.level === newBooking.bunkPreference);
  const filteredBookings = bookings.filter((booking) => `${booking.reference} ${booking.passengerName}`.toLowerCase().includes(searchTerm.toLowerCase()));

  const createBooking = (event) => {
    event.preventDefault();
    if (!selectedVoyage || !newBooking.passengerName.trim()) return;
    if (getSold(selectedVoyage.id) + Number(newBooking.quantity) > getVessel(selectedVoyage.vesselId).capacity) {
      alert('There is not enough remaining capacity on this voyage.');
      return;
    }
    const preferredBunks = newBooking.bunkPreference === 'Random' || newBooking.bunkPreference === 'Manual'
      ? availableBunks
      : availableBunks.filter((bunk) => bunk.level === newBooking.bunkPreference);
    const assignedBunk = newBooking.bunkPreference === 'Manual'
      ? preferredBunks.find((bunk) => bunk.id === newBooking.bunkId)
      : preferredBunks[0];
    if (!assignedBunk) {
      alert(newBooking.bunkPreference === 'Manual' ? 'Choose a bed from the layout.' : 'No beds are available in this section.');
      return;
    }
    // This timestamp is generated only after the user submits the hold form.
    // eslint-disable-next-line react-hooks/purity
    const booking = { ...newBooking, bunkId: assignedBunk.id, bunkLabel: assignedBunk.label, accommodation: assignedBunk.accommodation, section: assignedBunk.areaLabel, id: `booking-${Date.now()}`, reference: `BKG-${Date.now().toString().slice(-6)}`, status: 'Held', createdBy: currentUser, heldUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(), ticketNumber: '' };
    setBookings((current) => [booking, ...current]);
    setBookingPreview(booking);
    setNewBooking({ ...emptyBooking, voyageId: voyages[0]?.id || '' });
    setIsFormOpen(false);
  };

  const recordPayment = (bookingId) => setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status: 'Confirmed', paymentStatus: 'Paid', paidAt: new Date().toISOString(), paidBy: currentUser } : booking));
  const issueTicket = (bookingId) => setBookings((current) => current.map((booking) => booking.id === bookingId && booking.status === 'Confirmed' ? { ...booking, status: 'Ticket Issued', ticketNumber: `TKT-${Date.now().toString().slice(-8)}`, issuedAt: new Date().toISOString(), issuedBy: currentUser } : booking));

  return <div className="space-y-6">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">Commercial / Reservations</p><h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2"><Ticket className="w-6 h-6 text-blue-600" /> Bookings</h2><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reserve capacity first, record payment second, and issue the ticket only after confirmation.</p></div><button onClick={() => setIsFormOpen(true)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Create Booking</button></div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{['Held', 'Confirmed', 'Ticket Issued'].map((status) => <div key={status} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4"><p className="text-2xl font-bold text-slate-900 dark:text-white">{bookings.filter((booking) => booking.status === status).length}</p><p className="text-[11px] text-slate-500">{status} bookings</p></div>)}</div>

    <section className="space-y-3"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900 dark:text-white">Upcoming voyage capacity</h3><p className="text-xs text-slate-500 mt-1">Bookings reserve seats against one specific voyage.</p></div><div className="relative w-full sm:w-64"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search booking..." className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div></div><div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{voyages.slice(0, 8).map((voyage) => { const route = getRoute(voyage.routeId); const vessel = getVessel(voyage.vesselId); const sold = getSold(voyage.id); return <article key={voyage.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h4 className="font-bold text-sm text-slate-900 dark:text-white">{route.name}</h4><p className="text-[11px] text-slate-400 mt-1">{formatDate(voyage.departure)} · {vessel.name}</p></div><span className="text-xs font-bold text-blue-700 bg-blue-500/10 px-2 py-1">{vessel.capacity - sold} available</span></div><div className="flex items-center gap-2 mt-4 text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold">{route.originCode}</span><ArrowRight className="w-3.5 h-3.5 text-blue-500" /><span className="font-semibold">{route.destinationCode}</span><span className="ml-auto text-slate-400">{sold} reserved</span></div></article>; })}</div></section>

    <section className="space-y-3"><div><h3 className="font-bold text-slate-900 dark:text-white">Booking records</h3><p className="text-xs text-slate-500 mt-1">Payment and ticket actions are recorded against the booking reference.</p></div>{filteredBookings.length === 0 ? <div className="bg-white dark:bg-[#0f172a] border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500">No bookings yet. Create a booking to reserve voyage capacity.</div> : filteredBookings.map((booking) => { const voyage = getVoyage(booking.voyageId); const route = getRoute(voyage.routeId); return <article key={booking.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-5 shadow-sm"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h4 className="font-bold text-slate-900 dark:text-white">{booking.passengerName}</h4><span className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${STATUS_STYLES[booking.status]}`}>{booking.status}</span></div><p className="text-[11px] text-slate-400 mt-1">{booking.reference} · {route.name} · {booking.quantity} passenger(s) · {booking.section} · {booking.bunkLabel}</p><p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{formatDate(voyage.departure)} · Created by {booking.createdBy}</p>{booking.ticketNumber && <p className="text-xs text-emerald-600 mt-1">Ticket {booking.ticketNumber} · Issued by {booking.issuedBy}</p>}</div><div className="flex flex-wrap gap-2">{booking.status === 'Held' && <button onClick={() => recordPayment(booking.id)} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 !text-white text-xs font-bold flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Record Payment</button>}{booking.status === 'Confirmed' && <button onClick={() => issueTicket(booking.id)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Issue Ticket</button>}</div></div></article>; })}</section>

    {isFormOpen && (
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
        <form onSubmit={createBooking} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div><h3 className="font-bold text-lg text-slate-900 dark:text-white">Create Booking</h3><p className="text-xs text-slate-500 mt-1">Capacity is held for 15 minutes while payment is completed.</p></div>
            <button type="button" onClick={() => setIsFormOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">Voyage<select required value={newBooking.voyageId} onChange={(event) => updateField('voyageId', event.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">{voyages.map((voyage) => <option key={voyage.id} value={voyage.id}>{getRoute(voyage.routeId).name} · {formatDate(voyage.departure)}</option>)}</select></label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">Passenger name<input required value={newBooking.passengerName} onChange={(event) => updateField('passengerName', event.target.value)} placeholder="Full passenger name" className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" /></label>
            <div className="sm:col-span-2 border border-slate-200 dark:border-slate-700 p-4 space-y-4">
              <div><p className="text-xs font-bold text-slate-700 dark:text-slate-200">Accommodation section</p><p className="text-[11px] text-slate-500 mt-1">Choose the configured passenger bunk area. The system assigns a bed automatically.</p></div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Section<select value={newBooking.areaId} onChange={(event) => { updateField('areaId', event.target.value); updateField('bunkId', ''); }} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">{accommodations.map((accommodation) => <option key={accommodation.value} value={accommodation.value}>{accommodation.label} · {accommodation.description}</option>)}</select></label>
              <div className="grid grid-cols-3 gap-2"><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 col-span-2">Bed preference<select value={newBooking.bunkPreference} onChange={(event) => { updateField('bunkPreference', event.target.value); updateField('bunkId', ''); }} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"><option value="Random">Random</option><option value="Lower">Lower</option><option value="Top">Top</option><option value="Manual">Manual selection</option></select></label><div className="flex items-end text-[11px] text-slate-500 pb-2">{matchingBunks.length} available</div></div>
              {newBooking.bunkPreference === 'Manual' ? <div className="flex items-center justify-between gap-3 border border-slate-200 dark:border-slate-700 p-3"><div><p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Selected bed</p><p className="text-[11px] text-slate-500 mt-1">{newBooking.bunkId ? (bunks.find((bunk) => bunk.id === newBooking.bunkId)?.label || 'Bed selected') : 'None selected'}</p></div><button type="button" onClick={() => setIsBedLayoutOpen(true)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold">Open bed layout</button></div> : <p className="text-[11px] text-slate-500">A bed will be assigned automatically when capacity is held.</p>}
            </div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Contact number<input required value={newBooking.contact} onChange={(event) => updateField('contact', event.target.value)} placeholder="09xx xxx xxxx" className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" /></label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Passengers<input required min="1" type="number" value={newBooking.quantity} onChange={(event) => updateField('quantity', event.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" /></label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Payment method<select value={newBooking.paymentMethod} onChange={(event) => updateField('paymentMethod', event.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"><option>Cash</option><option>Bank transfer</option><option>Card</option><option>Online payment</option></select></label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Amount<input required min="0" type="number" value={newBooking.amount} onChange={(event) => updateField('amount', event.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" /></label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4"><button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Hold Capacity</button></div>
        </form>
      </div>
    )}
    {isBedLayoutOpen && <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"><div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl w-[95vw] h-[90vh] p-6 flex flex-col space-y-4 relative overflow-hidden"><div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0"><div><h3 className="font-bold text-lg text-slate-900 dark:text-white">Choose a bed</h3><p className="text-xs text-slate-500 mt-1">Select a position in {bunkAreas.find((area) => area.id === newBooking.areaId)?.label || 'this section'}.</p></div><button type="button" onClick={() => setIsBedLayoutOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="w-5 h-5" /></button></div><div className="flex-1 overflow-auto border-2 border-slate-300 dark:border-slate-800 bg-slate-950 relative shadow-inner"><div className="w-[1400px] h-[900px] relative select-none"><div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />{availableBunks.map((bunk) => { const isVertical = bunk.isVertical; const isSelected = newBooking.bunkId === bunk.id; return <button type="button" key={bunk.id} title={`${bunk.label} · ${bunk.level}`} aria-pressed={isSelected} onClick={() => updateField('bunkId', bunk.id)} style={{ left: `${bunk.x}px`, top: `${bunk.y}px`, width: isVertical ? '40px' : '60px', height: isVertical ? '60px' : '40px' }} className={`absolute border box-border flex ${isVertical ? 'flex-col justify-between py-1 px-1' : 'flex-row justify-between px-1.5 items-center'} cursor-pointer shadow-sm transition-shadow z-10 ${isSelected ? 'ring-4 ring-amber-300 border-white z-20 shadow-lg scale-110' : ''} ${bunk.level === 'Top' ? 'bg-sky-950/90 border-sky-400 text-sky-200' : 'bg-emerald-950/90 border-emerald-400 text-emerald-200'}`}><span className="leading-none text-left"><span className="block text-[10px] font-extrabold text-white">{bunk.label}</span><span className="block text-[8px] opacity-80 mt-0.5">{bunk.level[0]}L</span></span>{isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}</button>; })}</div></div><div className="flex items-center justify-between gap-3 shrink-0"><p className={`text-xs font-semibold ${newBooking.bunkId ? 'text-emerald-600' : 'text-slate-500'}`}>{newBooking.bunkId ? `Bed ${bunks.find((bunk) => bunk.id === newBooking.bunkId)?.label} selected` : 'Select a bed to continue'}</p><button type="button" onClick={() => setIsBedLayoutOpen(false)} disabled={!newBooking.bunkId} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold disabled:opacity-40">Confirm bed</button></div></div></div>}
    {bookingPreview && <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-5"><div className="flex items-start gap-3 border-b border-slate-200 dark:border-slate-800 pb-4"><div className="p-2 bg-blue-500/10 text-blue-600"><Ticket className="w-5 h-5" /></div><div><h3 className="font-bold text-lg text-slate-900 dark:text-white">Review booking ticket</h3><p className="text-xs text-slate-500 mt-1">Check the details before continuing to payment.</p></div></div><div className="border border-slate-200 dark:border-slate-700 p-4 space-y-3"><div className="flex items-center justify-between"><span className="text-[10px] uppercase font-bold text-slate-400">Booking reference</span><span className="text-sm font-bold text-slate-900 dark:text-white">{bookingPreview.reference}</span></div><div><p className="text-[10px] uppercase font-bold text-slate-400">Passenger</p><p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{bookingPreview.passengerName}</p><p className="text-xs text-slate-500">{bookingPreview.contact} · {bookingPreview.quantity} passenger(s)</p></div><div className="grid grid-cols-2 gap-3"><div><p className="text-[10px] uppercase font-bold text-slate-400">Voyage</p><p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">{getRoute(getVoyage(bookingPreview.voyageId).routeId).name}</p><p className="text-[11px] text-slate-500">{formatDate(getVoyage(bookingPreview.voyageId).departure)}</p></div><div><p className="text-[10px] uppercase font-bold text-slate-400">Accommodation</p><p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">{bookingPreview.section}</p><p className="text-[11px] text-slate-500">Bed {bookingPreview.bunkLabel} · {bookingPreview.bunkPreference}</p></div></div><div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3"><span className="text-xs text-slate-500">Amount due</span><span className="text-lg font-bold text-slate-900 dark:text-white">PHP {Number(bookingPreview.amount).toLocaleString()}</span></div></div><div className="flex justify-end gap-2"><button type="button" onClick={() => { setBookings((current) => current.filter((booking) => booking.id !== bookingPreview.id)); setNewBooking({ voyageId: bookingPreview.voyageId, passengerName: bookingPreview.passengerName, contact: bookingPreview.contact, quantity: bookingPreview.quantity, paymentMethod: bookingPreview.paymentMethod, amount: bookingPreview.amount, areaId: bookingPreview.areaId, bunkPreference: bookingPreview.bunkPreference, bunkId: bookingPreview.bunkId }); setBookingPreview(null); setIsFormOpen(true); }} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300">Edit booking</button><button type="button" onClick={() => setBookingPreview(null)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 !text-white text-xs font-bold">Looks correct - Continue to payment</button></div></div></div>}
  </div>;
}
