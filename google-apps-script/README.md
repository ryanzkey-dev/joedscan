# Google Sheets integration

Google Sheets is the live data source for this app — there is no other database. The dashboard
reads technicians and transactions directly from the spreadsheet (via `doGet`) and writes to it
on every create/update (via `doPost`). Materials/Inventory is the only thing that still lives in
the browser's `localStorage`.

## Tabs

- **`Technician`** — technician accounts (including password, since login reads this tab live).
  Auto-created with headers on first write.
- **`Transactions`** — full structured encoding-form submissions, including a `Status` column the
  admin can update. This is what the dashboard's Subscribers/Transactions/dashboards read from.
  Auto-created with headers on first write.
- **`Sheet1`** — the pre-existing 39-column legacy installer report (see "Column mapping" below).
  The app writes to it alongside `Transactions` on every encoding form submission, but never reads
  from it — it's kept for the business's existing report, not for the dashboard.
- **`JobOrders`** — created when an admin assigns a Pending subscriber (from `Transactions`) to a
  technician via Dispatch. Auto-created with headers on first write.
- **`RepairTickets`** — created via the admin Repair page's "Add Repair Ticket" form. Auto-created
  with headers on first write.
- **`ActivityLogs`** — append-only audit trail for job order / repair ticket create, assign, move,
  and status-change events. Auto-created with headers on first write.

## Dispatch / Repair API actions

These go through `doPost` like everything else, but are routed by an `action` field (in
[DispatchRepair.gs](DispatchRepair.gs)) rather than the older `formType` convention, and are kept
in a separate file so `Code.gs` itself only needed a 3-line change (an `if (data.action)` check at
the top of `doPost`). When pasting into the Apps Script editor, this needs to be a **second script
file** (File → New → Script, name it `DispatchRepair`) alongside `Code.gs` — Apps Script merges
all files in a project into one shared scope, so no imports are needed.

| Action | Purpose |
| --- | --- |
| `getPendingSubscribers` | Transactions where `status = Pending`, shaped for the Dispatch table |
| `getTechnicians` | All technician accounts (for the assign/move dropdown) |
| `createJobOrder` | Creates a JobOrders row, sets the source transaction's status to `Dispatched` |
| `getJobOrders` | All job orders (admin Dispatch page) |
| `getTechnicianJobOrders` | Job orders where `assignedTechnicianId` matches |
| `updateJobOrderStatus` | Technician sets `In Progress` / `Completed` |
| `moveJobOrderTechnician` | Admin reassigns a job order to a different technician |
| `addRepairTicket` | Creates a RepairTickets row, status defaults to `Pending` |
| `getRepairTickets` | All repair tickets (admin Repair page) |
| `getTechnicianRepairTickets` | Repair tickets where `assignedTechnicianId` matches |
| `dispatchRepairTicket` | Assigns a technician, sets status to `Dispatched` |
| `moveRepairTicketTechnician` | Admin reassigns a repair ticket to a different technician |
| `updateRepairStatus` | Admin or technician updates status |

**Known limitation**: `JobOrders.mobileNumber` is always blank when sourced from Dispatch, because
the `Transactions` sheet that pending subscribers come from has no Mobile Number column (it was
replaced by Project ID/FOC Serial/Modem/etc. in an earlier rework). Repair tickets are unaffected
since the admin types the mobile number directly into that form.

## Setup

1. Open your Google Sheet, then **Extensions → Apps Script**.
2. Delete any starter code and paste in the contents of [Code.gs](Code.gs).
3. Confirm `SHEET_NAME` matches your tab name (default: `Sheet1`).
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize the script when prompted, then copy the **Web app URL**.
6. In the project root, create a `.env` file (copy `.env.example`) and set:
   ```
   VITE_SHEET_WEBAPP_URL=https://script.google.com/macros/s/XXXXXXXX/exec
   ```
7. Restart `npm run dev` so Vite picks up the new env variable.

Every encoding form submission appends one row to **both** `Sheet1` and `Transactions`. Technician
account creation appends a row to `Technician`. IDs (`TECH-XXX`, `TRX-XXX`) are generated
server-side from each tab's current row count.

### Updating the script after the first deploy

Editing `Code.gs` in the Apps Script editor does **not** change what your live Web App runs —
deployments are frozen to a version. To update it:

- **Deploy → Manage deployments → pencil/edit icon → Version: New version → Deploy.** This keeps
  the same `/exec` URL, so nothing else needs to change.
- Do **not** use **Deploy → New deployment** for updates — that creates a brand-new `/exec` URL,
  and the app will keep silently posting to the old (stale) one until you update
  `VITE_SHEET_WEBAPP_URL` everywhere it's configured (local `.env`, and Vercel's Production/
  Preview/Development environment variables) and redeploy the frontend.

## Column mapping

`Sheet1` has 39 columns (A–AM) that predate this form and cover a wider installation
report than what the form collects. The script writes into the existing layout exactly,
leaving columns the form doesn't collect blank:

| Column | Header | Source |
| --- | --- | --- |
| C | UPLOADED GEOTAGGING | Summary string built from Start/End lat-lng + distance |
| I | DATE | Date field |
| J | TECH NAMES | Tech Names field |
| L | PROJECT ID | Project ID field |
| P | SUBSCRIBER | Subscriber field |
| Q | ADDRESS | Address field |
| V | FOC PREFAB SERIAL | FOC Traditional / Prefab Serial field |
| W | MODEM | Modem field |
| X | TELSET | Telset field |
| Y | IPTV CCA NO | IPTV CCA No. field |

All other columns (TMS, OFSC, REMARKS 2/3, MONTH, SO TYPE, SO VOICE/DATA/IPTV, CBR, TEL,
EXCHANGED, CPE STATUS, CAFAC, MHB, IOO, PATCH, OJB, CABLE TIE, FCLIP, FCLAMP, FIC, SPAN,
METER START/END/CONSUME, FOC TYPE) are left blank since the form doesn't capture them yet.
