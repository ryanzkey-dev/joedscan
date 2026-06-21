const SHEET_WEBAPP_URL = import.meta.env.VITE_SHEET_WEBAPP_URL

function requireUrl() {
  if (!SHEET_WEBAPP_URL) {
    throw new Error(
      'Google Sheet is not configured. Set VITE_SHEET_WEBAPP_URL in your .env file.'
    )
  }
  return SHEET_WEBAPP_URL
}

async function postToSheet(payload) {
  const url = requireUrl()

  const response = await fetch(url, {
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

function toGeotagging(row) {
  return {
    start: { latitude: row.startLatitude, longitude: row.startLongitude },
    end: { latitude: row.endLatitude, longitude: row.endLongitude },
    distanceMeters: row.distanceMeters,
    distanceKilometers: row.distanceKilometers,
  }
}

export async function fetchAllData() {
  const url = requireUrl()

  const response = await fetch(url, { method: 'GET' })
  if (!response.ok) {
    throw new Error('Failed to load data from Google Sheet.')
  }

  const result = await response.json()
  if (result.status !== 'ok') {
    throw new Error(result.message || 'Google Sheet returned an error.')
  }

  const technicians = (result.technicians || []).map((t) => ({ ...t, role: 'technician' }))
  const transactions = (result.transactions || []).map((t) => ({
    ...t,
    geotagging: toGeotagging(t),
  }))

  return { technicians, transactions }
}

export function createTechnician(record) {
  return postToSheet({ formType: 'technician', ...record })
}

export function createTransaction(record) {
  return postToSheet({ formType: 'encoding', ...record })
}

export function updateTransactionStatus(id, status) {
  return postToSheet({ formType: 'updateStatus', id, status })
}

// Generic action-routed call for Dispatch/Repair (and any future module that
// follows the { action, ...params } convention on the backend).
export async function apiRequest(action, params = {}) {
  const url = requireUrl()

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...params }),
  })

  if (!response.ok) {
    throw new Error('Failed to reach Google Sheet.')
  }

  const result = await response.json()
  if (result.status !== 'success' && result.status !== 'ok') {
    throw new Error(result.message || 'Google Sheet rejected the request.')
  }

  return result
}
