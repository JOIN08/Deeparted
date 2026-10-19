# Deeparted

LAN-based shipping operations dashboard prototype.

## Current stack

- React 19 and Vite
- TypeScript for the application entry points and shared data contracts
- Node.js/Express API with PostgreSQL sessions and account storage
- Tailwind CSS
- ESLint

The remaining feature screens are still JavaScript/JSX so the migration can happen incrementally without interrupting UI work.

## Code map

- `src/config/appConfig.ts` holds app-wide route paths and session timeout settings.
- `shared/access.ts` is the permission contract used by both client and server.
- `server/src/` holds the API; `server/migrations/` holds ordered SQL database migrations.
- `src/data/` holds shared records, storage helpers, voyage defaults, and report-template variables.
- `src/components/` holds the screens and their interaction state; keep reusable defaults and cross-screen settings in `config/` or `data/`.

## Access and data

User accounts can be assigned separate **View** and **Edit** permissions for Vessels, Voyages, Ports Manager, Routes, Reports, and Users. Edit includes view. Dashboard and Bookings are available to all accounts.

Authentication, accounts, and user-management permissions are backed by a Node API and PostgreSQL. Passwords are hashed by the API; the browser receives an HTTP-only session cookie and never connects directly to PostgreSQL.

Vessels, Voyages, Ports, Routes, Reports, and Booking operational records currently use browser-side storage and mock data. Their permissions control the interface, while account and user-management data are handled by the API.
