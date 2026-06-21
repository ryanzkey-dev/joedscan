# JOEDSCAN Technician Dashboard

A role-based dashboard for technician installation reporting: barcode scanning, manual
geotagging with Haversine distance calculation, inventory, and subscriber/transaction tracking.
Built with React + Vite + Tailwind CSS + Recharts. Data lives in `localStorage`; technician
accounts and encoding form submissions additionally sync to Google Sheets via an Apps Script Web
App (see [google-apps-script/](google-apps-script/) for setup).

## Run locally

```bash
npm install
npm run dev
```

## Default login

```
Admin: admin / joed123
```

Only the default admin account is seeded on first load. Use **Add Technician** in the admin
dashboard to create technician accounts — there is no other sample/demo data.
