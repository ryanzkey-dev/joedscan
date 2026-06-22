// Materials module backend. Relies on getOrCreateSheet, sheetRowsToObjects, jsonResponse,
// nextSequentialId, findRowIndexById, setCell, logActivity — all defined in Code.gs /
// DispatchRepair.gs (same Apps Script project, shared global scope — no import needed).

const MATERIALCATALOG_SHEET_NAME = 'MaterialCatalog'
const MATERIALCATALOG_HEADERS = ['id', 'materialName', 'requiresScanner', 'status', 'createdAt', 'updatedAt']

const MATERIALSTOCKS_SHEET_NAME = 'MaterialStocks'
const MATERIALSTOCKS_HEADERS = [
  'id',
  'catalogId',
  'materialName',
  'requiresScanner',
  'serialNumber',
  'quantity',
  'unit',
  'pcs',
  'currentOwnerType',
  'currentOwnerId',
  'currentOwnerName',
  'status',
  'createdAt',
  'updatedAt',
  'remarks',
]

const MATERIALTRANSACTIONS_SHEET_NAME = 'MaterialTransactions'
const MATERIALTRANSACTIONS_HEADERS = [
  'id',
  'transactionType',
  'materialStockId',
  'catalogId',
  'materialName',
  'serialNumber',
  'quantity',
  'unit',
  'pcs',
  'fromOwnerType',
  'fromOwnerId',
  'fromOwnerName',
  'toOwnerType',
  'toOwnerId',
  'toOwnerName',
  'status',
  'createdById',
  'createdByName',
  'createdAt',
  'remarks',
]

function routeMaterialsAction(action, data) {
  switch (action) {
    case 'getMaterialCatalog':
      return getMaterialCatalog()
    case 'addMaterialCatalog':
      return addMaterialCatalog(data)
    case 'updateMaterialCatalog':
      return updateMaterialCatalog(data)
    case 'deleteMaterialCatalog':
      return deleteMaterialCatalog(data)
    case 'addMaterialStock':
      return addMaterialStock(data)
    case 'getMaterialStocks':
      return getMaterialStocks()
    case 'getTechnicianMaterialStocks':
      return getTechnicianMaterialStocks(data)
    case 'updateMaterialStockStatus':
      return updateMaterialStockStatus(data)
    case 'sendMaterialsToTechnician':
      return sendMaterialsToTechnician(data)
    case 'transferMaterialAdmin':
      return transferMaterialStock(data, 'ADMIN_TRANSFER')
    case 'transferMaterialTechnician':
      return transferMaterialStock(data, 'TECHNICIAN_TRANSFER')
    case 'getMaterialTransactions':
      return getMaterialTransactions(data)
    default:
      return jsonResponse({ status: 'error', message: 'Unknown action: ' + action })
  }
}

// ---- Material Catalog ----

function getMaterialCatalog() {
  const sheet = getOrCreateSheet(MATERIALCATALOG_SHEET_NAME, MATERIALCATALOG_HEADERS)
  const rows = sheetRowsToObjects(sheet, MATERIALCATALOG_HEADERS)
  return jsonResponse({ status: 'ok', materialCatalog: rows })
}

function addMaterialCatalog(data) {
  const sheet = getOrCreateSheet(MATERIALCATALOG_SHEET_NAME, MATERIALCATALOG_HEADERS)
  const existing = sheetRowsToObjects(sheet, MATERIALCATALOG_HEADERS)
  const name = String(data.materialName || '').trim()

  const duplicate = existing.some(
    (m) => m.materialName.toLowerCase() === name.toLowerCase() && m.status !== 'Inactive'
  )
  if (duplicate) {
    return jsonResponse({ status: 'error', message: 'Material name already exists.' })
  }

  const id = nextSequentialId(sheet, 'MAT-CAT')
  const now = new Date().toISOString()
  sheet.appendRow([id, name, data.requiresScanner === 'Yes' ? 'Yes' : 'No', 'Active', now, now])

  logActivity('materialCatalog', 'Material Catalog Added', 'Added material ' + name, data.userId, data.userName)
  return jsonResponse({ status: 'success', id })
}

function updateMaterialCatalog(data) {
  const sheet = getOrCreateSheet(MATERIALCATALOG_SHEET_NAME, MATERIALCATALOG_HEADERS)
  const rowIndex = findRowIndexById(sheet, data.id)
  if (rowIndex === -1) {
    return jsonResponse({ status: 'error', message: 'Material not found.' })
  }

  if (data.materialName !== undefined) setCell(sheet, rowIndex, MATERIALCATALOG_HEADERS, 'materialName', data.materialName)
  if (data.requiresScanner !== undefined) {
    setCell(sheet, rowIndex, MATERIALCATALOG_HEADERS, 'requiresScanner', data.requiresScanner === 'Yes' ? 'Yes' : 'No')
  }
  if (data.status !== undefined) setCell(sheet, rowIndex, MATERIALCATALOG_HEADERS, 'status', data.status)
  setCell(sheet, rowIndex, MATERIALCATALOG_HEADERS, 'updatedAt', new Date().toISOString())

  logActivity('materialCatalog', 'Material Catalog Updated', 'Updated material ' + data.id, data.userId, data.userName)
  return jsonResponse({ status: 'success' })
}

function deleteMaterialCatalog(data) {
  const sheet = getOrCreateSheet(MATERIALCATALOG_SHEET_NAME, MATERIALCATALOG_HEADERS)
  const rowIndex = findRowIndexById(sheet, data.id)
  if (rowIndex === -1) {
    return jsonResponse({ status: 'error', message: 'Material not found.' })
  }

  setCell(sheet, rowIndex, MATERIALCATALOG_HEADERS, 'status', 'Inactive')
  setCell(sheet, rowIndex, MATERIALCATALOG_HEADERS, 'updatedAt', new Date().toISOString())

  logActivity('materialCatalog', 'Material Catalog Deactivated', 'Deactivated material ' + data.id, data.userId, data.userName)
  return jsonResponse({ status: 'success' })
}

// ---- Material Stocks ----

function appendStockRow(sheet, fields) {
  const id = nextSequentialId(sheet, 'STK')
  const now = new Date().toISOString()
  sheet.appendRow([
    id,
    fields.catalogId || '',
    fields.materialName || '',
    fields.requiresScanner || 'No',
    fields.serialNumber || '',
    fields.quantity || 0,
    fields.unit || '',
    fields.pcs || '',
    fields.currentOwnerType || 'Admin',
    fields.currentOwnerId || '',
    fields.currentOwnerName || '',
    fields.status || 'Available',
    now,
    now,
    fields.remarks || '',
  ])
  return id
}

function logMaterialTransaction(fields) {
  const sheet = getOrCreateSheet(MATERIALTRANSACTIONS_SHEET_NAME, MATERIALTRANSACTIONS_HEADERS)
  const id = nextSequentialId(sheet, 'MTX')
  sheet.appendRow([
    id,
    fields.transactionType || '',
    fields.materialStockId || '',
    fields.catalogId || '',
    fields.materialName || '',
    fields.serialNumber || '',
    fields.quantity || '',
    fields.unit || '',
    fields.pcs || '',
    fields.fromOwnerType || '',
    fields.fromOwnerId || '',
    fields.fromOwnerName || '',
    fields.toOwnerType || '',
    fields.toOwnerId || '',
    fields.toOwnerName || '',
    fields.status || '',
    fields.createdById || '',
    fields.createdByName || '',
    new Date().toISOString(),
    fields.remarks || '',
  ])
  return id
}

function createStockRowsWithTransaction(data, transactionType, ownerType, ownerId, ownerName, status) {
  const sheet = getOrCreateSheet(MATERIALSTOCKS_SHEET_NAME, MATERIALSTOCKS_HEADERS)
  const createdIds = []
  const baseFields = {
    catalogId: data.catalogId,
    materialName: data.materialName,
    unit: data.unit,
    pcs: data.pcs,
    currentOwnerType: ownerType,
    currentOwnerId: ownerId,
    currentOwnerName: ownerName,
    status: status,
    remarks: data.remarks,
  }

  if (data.requiresScanner === 'Yes') {
    const serials = data.serialNumbers || []
    serials.forEach(function (serial) {
      const id = appendStockRow(
        sheet,
        Object.assign({}, baseFields, { requiresScanner: 'Yes', serialNumber: serial, quantity: 1 })
      )
      createdIds.push(id)
      logMaterialTransaction({
        transactionType: transactionType,
        materialStockId: id,
        catalogId: data.catalogId,
        materialName: data.materialName,
        serialNumber: serial,
        quantity: 1,
        unit: data.unit,
        pcs: data.pcs,
        fromOwnerType: transactionType === 'ADD_STOCK' ? '' : 'Admin',
        fromOwnerId: '',
        fromOwnerName: '',
        toOwnerType: ownerType,
        toOwnerId: ownerId,
        toOwnerName: ownerName,
        status: status,
        createdById: data.userId,
        createdByName: data.userName,
        remarks: data.remarks,
      })
    })
  } else {
    const id = appendStockRow(
      sheet,
      Object.assign({}, baseFields, {
        requiresScanner: 'No',
        serialNumber: '',
        quantity: data.quantity,
      })
    )
    createdIds.push(id)
    logMaterialTransaction({
      transactionType: transactionType,
      materialStockId: id,
      catalogId: data.catalogId,
      materialName: data.materialName,
      serialNumber: '',
      quantity: data.quantity,
      unit: data.unit,
      pcs: data.pcs,
      fromOwnerType: transactionType === 'ADD_STOCK' ? '' : 'Admin',
      fromOwnerId: '',
      fromOwnerName: '',
      toOwnerType: ownerType,
      toOwnerId: ownerId,
      toOwnerName: ownerName,
      status: status,
      createdById: data.userId,
      createdByName: data.userName,
      remarks: data.remarks,
    })
  }

  return createdIds
}

function addMaterialStock(data) {
  const createdIds = createStockRowsWithTransaction(data, 'ADD_STOCK', 'Admin', '', '', 'Available')
  logActivity('materialStock', 'Material Stock Added', 'Added stock for ' + data.materialName, data.userId, data.userName)
  return jsonResponse({ status: 'success', ids: createdIds })
}

function sendMaterialsToTechnician(data) {
  const createdIds = createStockRowsWithTransaction(
    data,
    'SEND_TO_TECHNICIAN',
    'Technician',
    data.technicianId,
    data.technicianName,
    'On Hand'
  )
  logActivity(
    'materialStock',
    'Materials Sent',
    'Sent ' + data.materialName + ' to ' + data.technicianName,
    data.userId,
    data.userName
  )
  return jsonResponse({ status: 'success', ids: createdIds })
}

function getMaterialStocks() {
  const sheet = getOrCreateSheet(MATERIALSTOCKS_SHEET_NAME, MATERIALSTOCKS_HEADERS)
  const rows = sheetRowsToObjects(sheet, MATERIALSTOCKS_HEADERS)
  return jsonResponse({ status: 'ok', materialStocks: rows })
}

function getTechnicianMaterialStocks(data) {
  const sheet = getOrCreateSheet(MATERIALSTOCKS_SHEET_NAME, MATERIALSTOCKS_HEADERS)
  const rows = sheetRowsToObjects(sheet, MATERIALSTOCKS_HEADERS)
  const filtered = rows.filter((r) => r.currentOwnerId === String(data.technicianId))
  return jsonResponse({ status: 'ok', materialStocks: filtered })
}

function readStock(sheet, rowIndex) {
  const values = sheet.getRange(rowIndex, 1, 1, MATERIALSTOCKS_HEADERS.length).getValues()[0]
  const stock = {}
  MATERIALSTOCKS_HEADERS.forEach(function (key, i) {
    stock[key] = values[i]
  })
  return stock
}

function updateMaterialStockStatus(data) {
  const sheet = getOrCreateSheet(MATERIALSTOCKS_SHEET_NAME, MATERIALSTOCKS_HEADERS)
  const rowIndex = findRowIndexById(sheet, data.materialStockId)
  if (rowIndex === -1) {
    return jsonResponse({ status: 'error', message: 'Material stock not found.' })
  }

  const stock = readStock(sheet, rowIndex)

  setCell(sheet, rowIndex, MATERIALSTOCKS_HEADERS, 'status', data.status)
  setCell(sheet, rowIndex, MATERIALSTOCKS_HEADERS, 'updatedAt', new Date().toISOString())

  logMaterialTransaction({
    transactionType: 'USED',
    materialStockId: data.materialStockId,
    catalogId: stock.catalogId,
    materialName: stock.materialName,
    serialNumber: stock.serialNumber,
    quantity: stock.quantity,
    unit: stock.unit,
    pcs: stock.pcs,
    fromOwnerType: stock.currentOwnerType,
    fromOwnerId: stock.currentOwnerId,
    fromOwnerName: stock.currentOwnerName,
    toOwnerType: stock.currentOwnerType,
    toOwnerId: stock.currentOwnerId,
    toOwnerName: stock.currentOwnerName,
    status: data.status,
    createdById: data.userId,
    createdByName: data.userName,
    remarks: data.remarks,
  })

  logActivity(
    'materialStock',
    'Material Status Changed',
    'Material ' + data.materialStockId + ' status changed to ' + data.status,
    data.userId,
    data.userName
  )
  return jsonResponse({ status: 'success' })
}

function transferMaterialStock(data, transactionType) {
  const sheet = getOrCreateSheet(MATERIALSTOCKS_SHEET_NAME, MATERIALSTOCKS_HEADERS)
  const rowIndex = findRowIndexById(sheet, data.materialStockId)
  if (rowIndex === -1) {
    return jsonResponse({ status: 'error', message: 'Material stock not found.' })
  }

  const stock = readStock(sheet, rowIndex)
  if (String(stock.status) !== 'On Hand') {
    return jsonResponse({ status: 'error', message: 'Only materials with On Hand status can be transferred.' })
  }

  setCell(sheet, rowIndex, MATERIALSTOCKS_HEADERS, 'currentOwnerType', 'Technician')
  setCell(sheet, rowIndex, MATERIALSTOCKS_HEADERS, 'currentOwnerId', data.toTechnicianId || '')
  setCell(sheet, rowIndex, MATERIALSTOCKS_HEADERS, 'currentOwnerName', data.toTechnicianName || '')
  setCell(sheet, rowIndex, MATERIALSTOCKS_HEADERS, 'status', 'On Hand')
  setCell(sheet, rowIndex, MATERIALSTOCKS_HEADERS, 'updatedAt', new Date().toISOString())

  logMaterialTransaction({
    transactionType: transactionType,
    materialStockId: data.materialStockId,
    catalogId: stock.catalogId,
    materialName: stock.materialName,
    serialNumber: stock.serialNumber,
    quantity: stock.quantity,
    unit: stock.unit,
    pcs: stock.pcs,
    fromOwnerType: stock.currentOwnerType,
    fromOwnerId: data.fromTechnicianId || stock.currentOwnerId,
    fromOwnerName: data.fromTechnicianName || stock.currentOwnerName,
    toOwnerType: 'Technician',
    toOwnerId: data.toTechnicianId,
    toOwnerName: data.toTechnicianName,
    status: 'On Hand',
    createdById: data.userId,
    createdByName: data.userName,
    remarks: data.remarks,
  })

  logActivity(
    'materialStock',
    'Material Transferred',
    'Material ' + data.materialStockId + ' transferred to ' + data.toTechnicianName,
    data.userId,
    data.userName
  )
  return jsonResponse({ status: 'success' })
}

function getMaterialTransactions(data) {
  const sheet = getOrCreateSheet(MATERIALTRANSACTIONS_SHEET_NAME, MATERIALTRANSACTIONS_HEADERS)
  let rows = sheetRowsToObjects(sheet, MATERIALTRANSACTIONS_HEADERS)
  if (data && data.transactionType) {
    rows = rows.filter(function (r) {
      return r.transactionType === data.transactionType
    })
  }
  return jsonResponse({ status: 'ok', materialTransactions: rows })
}
