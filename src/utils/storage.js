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

function daysAgoIso(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
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

function seedSampleData(technicians) {
  const statuses = ['Pending', 'For Review', 'Completed', 'Rejected']
  const sampleSubscribers = [
    'Juan Dela Cruz',
    'Maria Santos',
    'Pedro Reyes',
    'Ana Garcia',
    'Jose Ramos',
    'Liza Torres',
    'Mark Cruz',
    'Grace Lim',
    'Paolo Fernandez',
    'Rosa Aquino',
    'Ben Castillo',
    'Nina Bautista',
  ]

  const transactions = []
  const subscribers = []

  sampleSubscribers.forEach((subscriberName, index) => {
    const tech = technicians[index % technicians.length]
    const daysAgo = Math.floor(index / 2)
    const createdAt = daysAgoIso(daysAgo)
    const transactionId = `TRX-${String(index + 1).padStart(3, '0')}`
    const subscriberId = `SUB-${String(index + 1).padStart(3, '0')}`
    const status = statuses[index % statuses.length]
    const startLat = (9.7 + index * 0.001).toFixed(6)
    const startLon = (123.5 + index * 0.001).toFixed(6)
    const endLat = (9.701 + index * 0.001).toFixed(6)
    const endLon = (123.501 + index * 0.001).toFixed(6)
    const distanceMeters = (120 + index * 7.5).toFixed(2)
    const distanceKilometers = (distanceMeters / 1000).toFixed(3)

    const geotagging = {
      start: { latitude: startLat, longitude: startLon },
      end: { latitude: endLat, longitude: endLon },
      distanceMeters,
      distanceKilometers,
    }

    const focPrefabSerial = `FOC-${1000 + index}`
    const modem = `MDM-${2000 + index}`
    const telset = `TEL-${3000 + index}`
    const iptvCcaNo = `CCA-${4000 + index}`
    const projectId = `PRJ-${100 + index}`
    const address = `${index + 1} Sample St., Demo City`

    transactions.push({
      id: transactionId,
      technicianId: tech.id,
      technicianName: tech.fullName,
      date: createdAt.slice(0, 10),
      projectId,
      subscriber: subscriberName,
      address,
      focPrefabSerial,
      modem,
      telset,
      iptvCcaNo,
      geotagging,
      status,
      createdAt,
    })

    subscribers.push({
      id: subscriberId,
      transactionId,
      subscriber: subscriberName,
      address,
      technicianId: tech.id,
      technicianName: tech.fullName,
      projectId,
      focPrefabSerial,
      modem,
      telset,
      iptvCcaNo,
      startLatitude: startLat,
      startLongitude: startLon,
      endLatitude: endLat,
      endLongitude: endLon,
      distanceMeters,
      status,
      createdAt,
    })
  })

  saveTransactions(transactions)
  saveSubscribers(subscribers)

  const materials = [
    { name: 'Fiber Optic Cable', category: 'Cable', quantity: 120, unit: 'meters' },
    { name: 'ONU Modem', category: 'Equipment', quantity: 35, unit: 'pcs' },
    { name: 'Set-top Box', category: 'Equipment', quantity: 4, unit: 'pcs' },
    { name: 'Cable Tie', category: 'Accessory', quantity: 500, unit: 'pcs' },
    { name: 'Fiber Connector', category: 'Accessory', quantity: 5, unit: 'pcs' },
    { name: 'Splitter', category: 'Equipment', quantity: 18, unit: 'pcs' },
  ].map((m, index) => ({
    id: `MAT-${String(index + 1).padStart(3, '0')}`,
    materialName: m.name,
    category: m.category,
    quantity: m.quantity,
    unit: m.unit,
    serialNumber: '',
    remarks: '',
    createdAt: daysAgoIso(10 - index),
  }))

  saveMaterials(materials)
}

export function seedInitialData() {
  const users = getUsers()
  if (users.length > 0) return

  const sampleTechnicians = [
    {
      id: 'TECH-001',
      fullName: 'Juan Dela Cruz',
      address: 'Dalaguete, Cebu',
      username: 'tech1',
      password: 'tech123',
      role: 'technician',
      createdAt: daysAgoIso(20),
    },
    {
      id: 'TECH-002',
      fullName: 'Maria Santos',
      address: 'Argao, Cebu',
      username: 'tech2',
      password: 'tech123',
      role: 'technician',
      createdAt: daysAgoIso(15),
    },
  ]

  saveTechnicians(sampleTechnicians)
  saveUsers([DEFAULT_ADMIN, ...sampleTechnicians])
  seedSampleData(sampleTechnicians)
}
