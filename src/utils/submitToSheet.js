const SHEET_WEBAPP_URL = import.meta.env.VITE_SHEET_WEBAPP_URL

export async function submitToSheet(payload) {
  if (!SHEET_WEBAPP_URL) {
    throw new Error(
      'Google Sheet is not configured. Set VITE_SHEET_WEBAPP_URL in your .env file.'
    )
  }

  const response = await fetch(SHEET_WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to submit to Google Sheet.')
  }

  const result = await response.json()
  if (result.status !== 'success') {
    throw new Error(result.message || 'Google Sheet rejected the submission.')
  }

  return result
}
