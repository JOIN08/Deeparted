export type PassengerTicketReport = {
  id: string;
  title: string;
  paperSize: string;
  floatingElements: unknown[];
  content: string;
};

export const PASSENGER_TICKET_REPORT: PassengerTicketReport = {
  id: "rep-1",
  title: "Passenger Ticket & Boarding Pass",
  paperSize: "A4",
  floatingElements: [],
  content: `
    <div style="font-family: Arial, sans-serif; color: #17232b; border: 2px solid #123044; padding: 24px; max-width: 680px; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #168a8a; padding-bottom:16px; margin-bottom:18px;">
        <div><p style="margin:0; font-size:11px; letter-spacing:2px; color:#168a8a; font-weight:bold;">DEEPARTED</p><h1 style="margin:6px 0 0; font-size:26px; color:#123044;">BOARDING PASS</h1></div>
        <div style="text-align:right;"><p style="margin:0; font-size:10px; color:#687780;">BOOKING REFERENCE</p><strong style="font-size:18px;">{{booking_reference}}</strong></div>
      </div>
      <p style="margin:0 0 16px; font-size:12px; color:#687780;">Review copy - ticket is issued after payment confirmation.</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div><p style="margin:0; font-size:10px; color:#687780; text-transform:uppercase; font-weight:bold;">Passenger</p><p style="margin:5px 0 0; font-size:16px; font-weight:bold;">{{passenger_name}}</p><p style="margin:4px 0 0; font-size:12px;">{{contact_number}}</p></div>
        <div><p style="margin:0; font-size:10px; color:#687780; text-transform:uppercase; font-weight:bold;">Voyage</p><p style="margin:5px 0 0; font-size:14px; font-weight:bold;">{{route_name}}</p><p style="margin:4px 0 0; font-size:12px;">{{departure_date}}</p></div>
        <div><p style="margin:0; font-size:10px; color:#687780; text-transform:uppercase; font-weight:bold;">Accommodation</p><p style="margin:5px 0 0; font-size:14px; font-weight:bold;">{{section_name}}</p><p style="margin:4px 0 0; font-size:12px;">Bed {{bed_number}} · {{bed_preference}}</p></div>
        <div><p style="margin:0; font-size:10px; color:#687780; text-transform:uppercase; font-weight:bold;">Amount due</p><p style="margin:5px 0 0; font-size:20px; font-weight:bold;">{{ticket_price}}</p><p style="margin:4px 0 0; font-size:12px;">{{payment_method}}</p></div>
      </div>
      <div style="margin-top:22px; padding-top:14px; border-top:1px dashed #b7c7c9; display:flex; justify-content:space-between; font-size:11px; color:#687780;"><span>Vessel: {{vessel_name}}</span><span>Status: {{payment_status}}</span></div>
    </div>
  `,
};

const REPORTS_STORAGE_KEY = "reportgen.reports.v3";

export const getPassengerTicketReport = () => {
  try {
    const reports = JSON.parse(
      window.localStorage.getItem(REPORTS_STORAGE_KEY) || "[]",
    ) as PassengerTicketReport[];
    return (
      reports.find((report) => report.id === PASSENGER_TICKET_REPORT.id) ||
      PASSENGER_TICKET_REPORT
    );
  } catch {
    return PASSENGER_TICKET_REPORT;
  }
};

export const renderPassengerTicket = (
  values: Record<string, string | number>,
  report: PassengerTicketReport = getPassengerTicketReport(),
) =>
  Object.entries(values).reduce(
    (html, [tag, value]) => html.replaceAll(`{{${tag}}}`, String(value ?? "")),
    report.content,
  );
