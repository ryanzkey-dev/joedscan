import { generateId } from './idGenerator'

const KEYS = {
  materials: 'materials',
  loggedInUser: 'loggedInUser',
}

// Bump this whenever a data-shape change should auto-reset existing
// localStorage instead of requiring users to manually clear it.
const CURRENT_DATA_VERSION = 3
const DATA_VERSION_KEY = 'dataVersion'

// Keys used by older versions of this app that no longer apply now that
// technicians/transactions/subscribers live in Google Sheets.
const LEGACY_KEYS = ['users', 'technicians', 'transactions', 'subscribers']

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

export const getMaterials = () => read(KEYS.materials, [])
export const saveMaterials = (materials) => write(KEYS.materials, materials)

export const getLoggedInUser = () => read(KEYS.loggedInUser, null)
export const setLoggedInUser = (user) => write(KEYS.loggedInUser, user)
export const clearLoggedInUser = () => localStorage.removeItem(KEYS.loggedInUser)

export function addMaterial({ materialName, category, quantity, unit, serialNumber, remarks }) {
  const materials = getMaterials()
  const id = generateId('MAT', materials.map((m) => m.id))
  const record = {
    id,
    materialName,
    category,
    quantity: Number(quantity) || 0,
    unit,
    serialNumber: serialNumber || '',
    remarks: remarks || '',
    createdAt: new Date().toISOString(),
  }
  saveMaterials([...materials, record])
  return record
}

export function updateMaterial(id, updates) {
  const materials = getMaterials().map((m) =>
    m.id === id ? { ...m, ...updates, quantity: Number(updates.quantity) || 0 } : m
  )
  saveMaterials(materials)
}

export function deleteMaterial(id) {
  saveMaterials(getMaterials().filter((m) => m.id !== id))
}

export function cleanupLegacyStorage() {
  const storedVersion = Number(localStorage.getItem(DATA_VERSION_KEY) || 0)
  if (storedVersion === CURRENT_DATA_VERSION) return

  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key))
  clearLoggedInUser()
  localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION))
}
