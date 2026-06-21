# JOEDSCAN Technician Dashboard

A role-based dashboard for technician installation reporting: barcode scanning, manual
geotagging with Haversine distance calculation, inventory, and subscriber/transaction tracking.
Built with React + Vite + Tailwind CSS + Recharts.

**Google Sheets is the live data source** for technicians and transactions — the app reads and
writes directly to a spreadsheet via an Apps Script Web App (see
[google-apps-script/](google-apps-script/) for setup and architecture). Only Materials/Inventory
stays in the browser's `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

## Login

```
Admin: admin / joed123
```

Admin is a fixed system credential. Technician accounts are created via **Add Technician** in
the admin dashboard and authenticate against the live `Technician` sheet — there is no other
sample/demo data anywhere in the app.
