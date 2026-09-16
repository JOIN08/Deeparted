# Philippine Shipping Hub

LAN-based shipping operations dashboard prototype.

## Current stack

- React 19 and Vite
- TypeScript for the application entry points and shared data contracts
- Tailwind CSS
- ESLint

The remaining feature screens are still JavaScript/JSX so the migration can happen incrementally without interrupting UI work.

## Development

```bash
npm install
npm run dev
```

Validation commands:

```bash
npm run typecheck
npm run lint
npm run build
```

## Planned deployment

The production target is one server computer on the port's LAN. Users will access the web client through that server. The database will run directly on the host hardware and will not be placed inside a Docker container.

Docker can later package the web/API services while the database remains an externally managed host service. The frontend must not connect directly to the database; a server-side API will provide authentication, authorization, validation, and synchronization between ports.

## GitHub hygiene

Do not commit passwords, database credentials, private keys, `.env` files, `node_modules`, or `dist`. Local environment files are ignored; commit a sanitized `.env.example` when API configuration is introduced.
