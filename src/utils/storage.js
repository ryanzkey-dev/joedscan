import { generateId } from './idGenerator'

const KEYS = {
  users: 'users',
  technicians: 'technicians',
  transactions: 'transactions',
  subscribers: 'subscribers',
  materials: 'materials',
  loggedInUser: 'loggedInUser',
}

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

export const getUsers = () => read(KEYS.users, [])
export const saveUsers = (users) => write(KEYS.users, users)

export const getTechnicians = () => read(KEYS.technicians, [])
export const saveTechnicians = (technicians) => write(KEYS.technicians, technicians)

export const getTransactions = () => read(KEYS.transactions, [])
export const saveTransactions = (transactions) => write(KEYS.transactions, transactions)

export const getSubscribers = () => read(KEYS.subscribers, [])
export const saveSubscribers = (subscribers) => write(KEYS.subscribers, subscribers)

export const getMaterials = () => read(KEYS.materials, [])
export const saveMaterials = (materials) => write(KEYS.materials, materials)

export const getLoggedInUser = () => read(KEYS.loggedInUser, null)
export const setLoggedInUser = (user) => write(KEYS.loggedInUser, user)
export const clearLoggedInUser = () => localStorage.removeItem(KEYS.loggedInUser)

const DEFAULT_ADMIN = {
  id: 'USER-001',
  username: 'admin',
  password: 'joed123',
  role: 'admin',
  fullName: 'Administrator',
  createdAt: new Date().toISOString(),
}

export function addTechnician({ fullName, address, username, password }) {
  const technicians = getTechnicians()
  const users = getUsers()
  const id = generateId('TECH', technicians.map((t) => t.id))
  const record = {
    id,
    fullName,
    address,
    username,
    password,
    role: 'technician',
    createdAt: new Date().toISOString(),
  }
  saveTechnicians([...technicians, record])
  saveUsers([...users, record])
  return record
}

export function isUsernameTaken(username) {
  return getUsers().some((u) => u.username.toLowerCase() === username.toLowerCase())
}

export function addTransaction(payload) {
  const transactions = getTransactions()
  const subscribers = getSubscribers()

  const transactionId = generateId('TRX', transactions.map((t) => t.id))
  const subscriberId = generateId('SUB', subscribers.map((s) => s.id))
  const createdAt = new Date().toISOString()

  const transaction = {
    id: transactionId,
    technicianId: payload.technicianId,
    technicianName: payload.technicianName,
    date: payload.date,
    projectId: payload.projectId,
    subscriber: payload.subscriber,
    address: payload.address,
    focPrefabSerial: payload.focPrefabSerial,
    modem: payload.modem,
    telset: payload.telset,
    iptvCcaNo: payload.iptvCcaNo,
    geotagging: payload.geotagging,
    status: 'Pending',
    createdAt,
  }

  const subscriberRecord = {
    id: subscriberId,
    transactionId,
    subscriber: payload.subscriber,
    address: payload.address,
    technicianId: payload.technicianId,
    technicianName: payload.technicianName,
    projectId: payload.projectId,
    focPrefabSerial: payload.focPrefabSerial,
    modem: payload.modem,
    telset: payload.telset,
    iptvCcaNo: payload.iptvCcaNo,
    startLatitude: payload.geotagging.start.latitude,
    startLongitude: payload.geotagging.start.longitude,
    endLatitude: payload.geotagging.end.latitude,
    endLongitude: payload.geotagging.end.longitude,
    distanceMeters: payload.geotagging.distanceMeters,
    status: 'Pending',
    createdAt,
  }

  saveTransactions([...transactions, transaction])
  saveSubscribers([...subscribers, subscriberRecord])

  return transaction
}

export function updateTransactionStatus(transactionId, status) {
  const transactions = getTransactions().map((t) =>
    t.id === transactionId ? { ...t, status } : t
  )
  saveTransactions(transactions)

  const subscribers = getSubscribers().map((s) =>
    s.transactionId === transactionId ? { ...s, status } : s
  )
  saveSubscribers(subscribers)
}

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

export function seedInitialData() {
  const users = getUsers()
  if (users.length > 0) return

  saveUsers([DEFAULT_ADMIN])
}
