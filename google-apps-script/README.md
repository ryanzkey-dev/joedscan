# Google Sheets integration

This form submits data to your Google Sheet via a Google Apps Script Web App
(no separate backend, no exposed API keys).

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

Every form submission appends one row to `Sheet1`, adding a header row automatically only if the
sheet is empty (your sheet already has its header row, so this won't run). Technician account
creation appends a row to a `Technician` tab (auto-created if missing) instead.

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
