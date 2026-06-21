# JOEDSCAN Technician Dashboard

A prototype role-based dashboard for technician installation reporting: barcode scanning,
geotagging with EXIF GPS extraction and Haversine distance calculation, inventory, and
subscriber/transaction tracking. Built with React + Vite + Tailwind CSS + Recharts, using
`localStorage` only (no backend, no database).

## Run locally

```bash
npm install
npm run dev
```

## Default login

```
Admin:      admin / joed123
Technician: tech1 / tech123  (or tech2 / tech123)
```

Sample technicians, transactions, subscribers, and materials are seeded automatically on first
load if `localStorage` is empty.

## Legacy: Google Sheets integration

This project previously submitted forms to a Google Sheet via a Google Apps Script Web App
(see [google-apps-script/](google-apps-script/)). That integration is no longer used by the app
— data now lives entirely in `localStorage` — but the script and setup docs are left in the repo
for reference.
