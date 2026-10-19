export const REPORT_VARIABLE_GROUPS = [
  {
    category: "Passenger & Ticket",
    vars: [
      { label: "Passenger Name", tag: "{{passenger_name}}" },
      { label: "Bed / Berth No.", tag: "{{bed_number}}" },
      { label: "Class Type", tag: "{{accommodation_class}}" },
      { label: "Ticket Price", tag: "{{ticket_price}}" },
      { label: "Payment Status", tag: "{{payment_status}}" },
      { label: "Ticket Reference ID", tag: "{{ticket_id}}" },
    ],
  },
  {
    category: "Vessel & Fleet",
    vars: [
      { label: "Vessel Name", tag: "{{vessel_name}}" },
      { label: "IMO / Call Sign", tag: "{{vessel_imo}}" },
      { label: "Captain Name", tag: "{{captain_name}}" },
      { label: "Max Capacity", tag: "{{vessel_capacity}}" },
    ],
  },
  {
    category: "Route & Port",
    vars: [
      { label: "Origin Port", tag: "{{origin_port}}" },
      { label: "Destination Port", tag: "{{destination_port}}" },
      { label: "Departure Date/Time", tag: "{{departure_date}}" },
      { label: "Arrival Date/Time", tag: "{{arrival_date}}" },
    ],
  },
  {
    category: "Financial & Monthly Analytics",
    vars: [
      { label: "Report Month", tag: "{{report_month}}" },
      { label: "Report Year", tag: "{{report_year}}" },
      { label: "Passenger Fare Revenue", tag: "{{total_passenger_revenue}}" },
      { label: "Cargo & Freight Revenue", tag: "{{total_cargo_revenue}}" },
      { label: "Gross Earnings", tag: "{{gross_monthly_earnings}}" },
      { label: "Operational Cost", tag: "{{total_operational_cost}}" },
    ],
  },
  {
    category: "System & Metadata",
    vars: [
      { label: "Current Date", tag: "{{current_date}}" },
      { label: "Logged Admin", tag: "{{admin_username}}" },
      { label: "Company Name", tag: "{{company_name}}" },
      { label: "Signatory Name", tag: "{{signatory_name}}" },
    ],
  },
];

const SAMPLE_REPORT_DATA = {
  "{{passenger_name}}": "Juan Cruz",
  "{{bed_number}}": "B-104 Upper",
  "{{accommodation_class}}": "Tourist Aircon",
  "{{ticket_price}}": "₱1,250.00",
  "{{payment_status}}": "PAID",
  "{{ticket_id}}": "TKT-2026-9901",
  "{{vessel_name}}": "MV Trans-Island Express",
  "{{vessel_imo}}": "IMO: 9123456",
  "{{captain_name}}": "Capt. R. Rodriguez",
  "{{vessel_capacity}}": "450 Passengers",
  "{{origin_port}}": "Port of Manila",
  "{{destination_port}}": "Cebu International Port",
  "{{departure_date}}": "August 30, 2026 - 08:00 AM",
  "{{arrival_date}}": "August 31, 2026 - 04:00 AM",
  "{{report_month}}": "August",
  "{{report_year}}": "2026",
  "{{total_passenger_revenue}}": "₱4,850,000.00",
  "{{total_cargo_revenue}}": "₱2,100,000.00",
  "{{gross_monthly_earnings}}": "₱6,950,000.00",
  "{{total_operational_cost}}": "₱3,200,000.00",
  "{{admin_username}}": "Jeff",
  "{{company_name}}": "Maritime Logistics Inc.",
  "{{signatory_name}}": "Jeff Santos",
};

export function getReportSampleData(customVariables) {
  return {
    ...SAMPLE_REPORT_DATA,
    "{{current_date}}": new Date().toLocaleDateString(),
    ...Object.fromEntries(
      customVariables.map((variable) => [
        variable.tag,
        variable.sample || `[${variable.label}]`,
      ]),
    ),
  };
}
