// Bump this whenever a data-shape change should auto-reset existing
// localStorage instead of requiring users to manually clear it.
const CURRENT_DATA_VERSION = 4
const DATA_VERSION_KEY = 'dataVersion'

// Keys used by older versions of this app that no longer apply now that
// technicians/transactions/subscribers/materials live in Google Sheets.
const LEGACY_KEYS = ['users', 'technicians', 'transactions', 'subscribers', 'materials']

const LOGGED_IN_USER_KEY = 'loggedInUser'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getLoggedInUser = () => read(LOGGED_IN_USER_KEY, null)
export const setLoggedInUser = (user) => write(LOGGED_IN_USER_KEY, user)
export const clearLoggedInUser = () => localStorage.removeItem(LOGGED_IN_USER_KEY)

export function cleanupLegacyStorage() {
  const storedVersion = Number(localStorage.getItem(DATA_VERSION_KEY) || 0)
  if (storedVersion === CURRENT_DATA_VERSION) return

  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key))
  clearLoggedInUser()
  localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION))
}
