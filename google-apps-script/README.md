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

Every form submission appends one row to `Sheet1`, adding a header row automatically on first run.
