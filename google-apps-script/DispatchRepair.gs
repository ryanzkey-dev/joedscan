// Dispatch and Repair module backend. Relies on getOrCreateSheet, sheetRowsToObjects,
// jsonResponse, nextSequentialId, TRANSACTIONS_SHEET_NAME, TRANSACTIONS_HEADERS, and
// TECHNICIAN_SHEET_NAME / TECHNICIAN_HEADERS, all defined in Code.gs (same Apps Script
// project, shared global scope — no import needed).

const JOBORDERS_SHEET_NAME = 'JobOrders'
const JOBORDERS_HEADERS = [
  'id',
  'sourceId',
  'sourceType',
  'subscriberId',
  'transactionId',
  'subscriberName',
  'address',
  'projectId',
  'encodedByTechnicianId',
  'encodedByTechnicianName',
  'assignedTechnicianId',
  'assignedTechnicianName',
  'status',
  'dispatchDate',
  'createdAt',
  'updatedAt',
  'remarks',
]

const REPAIRTICKETS_SHEET_NAME = 'RepairTickets'
const REPAIRTICKETS_HEADERS = [
  'id',
  'subscriberName',
  'mobileNumber',
  'address',
  'issueType',
  'issueDescription',
  'priority',
  'remarks',
  'status',
  'assignedTechnicianId',
  'assignedTechnicianName',
  'dispatchDate',
  'createdAt',
  'updatedAt',
]

const ACTIVITYLOGS_SHEET_NAME = 'ActivityLogs'
const ACTIVITYLOGS_HEADERS = ['id', 'type', 'title', 'description', 'userId', 'userName', 'createdAt']

function logActivity(type, title, description, userId, userName) {
  const sheet = getOrCreateSheet(ACTIVITYLOGS_SHEET_NAME, ACTIVITYLOGS_HEADERS)
  const id = nextSequentialId(sheet, 'LOG')
  sheet.appendRow([id, type, title, description, userId || '', userName || '', new Date().toISOString()])
}

function findRowIndexById(sheet, id) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return -1
  const idColumn = sheet.getRange(2, 1, lastRow - 1, 1).getValues()
  for (let i = 0; i < idColumn.length; i++) {
    if (String(idColumn[i][0]) === String(id)) return i + 2
  }
  return -1
}

function setCell(sheet, rowIndex, headers, key, value) {
  const col = headers.indexOf(key) + 1
  sheet.getRange(rowIndex, col).setValue(value)
}

function routeDispatchRepairAction(action, data) {
  switch (action) {
    case 'getPendingSubscribers':
      return getPendingSubscribers()
    case 'getTechnicians':
      return getTechniciansAction()
    case 'createJobOrder':
      return createJobOrder(data)
    case 'getJobOrders':
      return getJobOrders()
    case 'getTechnicianJobOrders':
      return getTechnicianJobOrders(data)
    case 'updateJobOrderStatus':
      return updateJobOrderStatus(data)
    case 'moveJobOrderTechnician':
      return moveJobOrderTechnician(data)
    case 'addRepairTicket':
      return addRepairTicket(data)
    case 'bulkAddRepairTickets':
      return bulkAddRepairTickets(data)
    case 'getRepairTickets':
      return getRepairTickets()
    case 'getTechnicianRepairTickets':
      return getTechnicianRepairTickets(data)
    case 'dispatchRepairTicket':
      return dispatchRepairTicket(data)
    case 'moveRepairTicketTechnician':
      return moveRepairTicketTechnician(data)
    case 'updateRepairStatus':
      return updateRepairStatus(data)
    default:
      return routeMaterialsAction(action, data)
  }
}

function getTechniciansAction() {
  const sheet = getOrCreateSheet(TECHNICIAN_SHEET_NAME, TECHNICIAN_HEADERS)
  const rows = sheetRowsToObjects(sheet, ['id', 'fullName', 'address', 'username', 'password', 'createdAt'])
  return jsonResponse({ status: 'ok', technicians: rows })
}

// ---- Dispatch / Job Orders ----

function getPendingSubscribers() {
  const sheet = getOrCreateSheet(TRANSACTIONS_SHEET_NAME, TRANSACTIONS_HEADERS)
  const rows = sheetRowsToObjects(sheet, [
    'id',
    'technicianId',
    'technicianName',
    'date',
    'projectId',
    'subscriber',
    'address',
    'focPrefabSerial',
    'modem',
    'telset',
    'iptvCcaNo',
    'startLatitude',
    'startLongitude',
    'endLatitude',
    'endLongitude',
    'distanceMeters',
    'distanceKilometers',
    'status',
    'createdAt',
  ])

  const pending = rows
    .filter((r) => r.status === 'Pending')
    .map((r) => ({
      id: r.id,
      subscriberName: r.subscriber,
      mobileNumber: '',
      address: r.address,
      projectId: r.projectId,
      serialNumber: r.focPrefabSerial,
      encodedByTechnicianId: r.technicianId,
      encodedByTechnicianName: r.technicianName,
      status: r.status,
      createdAt: r.createdAt,
    }))

  return jsonResponse({ status: 'ok', subscribers: pending })
}

function createJobOrder(data) {
  const transactionsSheet = getOrCreateSheet(TRANSACTIONS_SHEET_NAME, TRANSACTIONS_HEADERS)
  const trxRowIndex = findRowIndexById(transactionsSheet, data.subscriberId)
  if (trxRowIndex === -1) {
    return jsonResponse({ status: 'error', message: 'Subscriber not found.' })
  }

  const trxValues = transactionsSheet
    .getRange(trxRowIndex, 1, 1, TRANSACTIONS_HEADERS.length)
    .getValues()[0]
  const trxKeys = [
    'id',
    'technicianId',
    'technicianName',
    'date',
    'projectId',
    'subscriber',
    'address',
    'focPrefabSerial',
    'modem',
    'telset',
    'iptvCcaNo',
    'startLatitude',
    'startLongitude',
    'endLatitude',
    'endLongitude',
    'distanceMeters',
    'distanceKilometers',
    'status',
    'createdAt',
  ]
  const trx = {}
  trxKeys.forEach((key, i) => {
    trx[key] = trxValues[i]
  })

  const sheet = getOrCreateSheet(JOBORDERS_SHEET_NAME, JOBORDERS_HEADERS)
  const id = nextSequentialId(sheet, 'JO')
  const now = new Date().toISOString()

  sheet.appendRow([
    id,
    trx.id,
    'subscriber',
    trx.id,
    trx.id,
    trx.subscriber,
    trx.address,
    trx.projectId || data.projectId || '',
    trx.technicianId,
    trx.technicianName,
    data.assignedTechnicianId || '',
    data.assignedTechnicianName || '',
    'Dispatched',
    now,
    now,
    now,
    data.remarks || '',
  ])

  const statusColumnIndex = TRANSACTIONS_HEADERS.indexOf('Status') + 1
  transactionsSheet.getRange(trxRowIndex, statusColumnIndex).setValue('Dispatched')

  logActivity('jobOrder', 'Job Order Created', 'Job order ' + id + ' created for ' + trx.subscriber, '', '')
  logActivity(
    'jobOrder',
    'Job Order Assigned',
    'Job order ' + id + ' assigned to ' + data.assignedTechnicianName,
    data.assignedTechnicianId,
    data.assignedTechnicianName
  )

  return jsonResponse({ status: 'success', id })
}

function getJobOrders() {
  const sheet = getOrCreateSheet(JOBORDERS_SHEET_NAME, JOBORDERS_HEADERS)
  const rows = sheetRowsToObjects(sheet, JOBORDERS_HEADERS)
  return jsonResponse({ status: 'ok', jobOrders: rows })
}

function getTechnicianJobOrders(data) {
  const sheet = getOrCreateSheet(JOBORDERS_SHEET_NAME, JOBORDERS_HEADERS)
  const rows = sheetRowsToObjects(sheet, JOBORDERS_HEADERS)
  const filtered = rows.filter((r) => r.assignedTechnicianId === String(data.technicianId))
  return jsonResponse({ status: 'ok', jobOrders: filtered })
}

function updateJobOrderStatus(data) {
  const sheet = getOrCreateSheet(JOBORDERS_SHEET_NAME, JOBORDERS_HEADERS)
  const rowIndex = findRowIndexById(sheet, data.jobOrderId)
  if (rowIndex === -1) {
    return jsonResponse({ status: 'error', message: 'Job Order not found.' })
  }

  setCell(sheet, rowIndex, JOBORDERS_HEADERS, 'status', data.status)
  setCell(sheet, rowIndex, JOBORDERS_HEADERS, 'updatedAt', new Date().toISOString())

  logActivity(
    'jobOrder',
    'Job Order Status Changed',
    'Job order ' + data.jobOrderId + ' status changed to ' + data.status,
    '',
    ''
  )
  return jsonResponse({ status: 'success' })
}

function moveJobOrderTechnician(data) {
  const sheet = getOrCreateSheet(JOBORDERS_SHEET_NAME, JOBORDERS_HEADERS)
  const rowIndex = findRowIndexById(sheet, data.jobOrderId)
  if (rowIndex === -1) {
    return jsonResponse({ status: 'error', message: 'Job Order not found.' })
  }

  setCell(sheet, rowIndex, JOBORDERS_HEADERS, 'assignedTechnicianId', data.assignedTechnicianId || '')
  setCell(sheet, rowIndex, JOBORDERS_HEADERS, 'assignedTechnicianName', data.assignedTechnicianName || '')
  setCell(sheet, rowIndex, JOBORDERS_HEADERS, 'updatedAt', new Date().toISOString())

  logActivity(
    'jobOrder',
    'Job Order Moved',
    'Job order ' + data.jobOrderId + ' moved to ' + data.assignedTechnicianName,
    data.assignedTechnicianId,
    data.assignedTechnicianName
  )
  return jsonResponse({ status: 'success' })
}

// ---- Repair Tickets ----

function addRepairTicket(data) {
  const sheet = getOrCreateSheet(REPAIRTICKETS_SHEET_NAME, REPAIRTICKETS_HEADERS)
  const id = nextSequentialId(sheet, 'REP')
  const now = new Date().toISOString()

  sheet.appendRow([
    id,
    data.subscriberName || '',
    data.mobileNumber || '',
    data.address || '',
    data.issueType || '',
    data.issueDescription || '',
    data.priority || 'Medium',
    data.remarks || '',
    'Pending',
    '',
    '',
    '',
    now,
    now,
  ])

  logActivity('repair', 'Repair Ticket Created', 'Repair ticket ' + id + ' created for ' + data.subscriberName, '', '')
  return jsonResponse({ status: 'success', id })
}

function bulkAddRepairTickets(data) {
  const sheet = getOrCreateSheet(REPAIRTICKETS_SHEET_NAME, REPAIRTICKETS_HEADERS)
  const tickets = data.tickets || []
  const now = new Date().toISOString()
  let addedCount = 0
  let failedCount = 0

  tickets.forEach(function (ticket) {
    const hasRequired =
      ticket.subscriberName &&
      ticket.mobileNumber &&
      ticket.address &&
      ticket.issueType &&
      ticket.issueDescription &&
      ticket.priority &&
      ticket.status
    if (!hasRequired) {
      failedCount++
      return
    }

    const id = nextSequentialId(sheet, 'REP')
    sheet.appendRow([
      id,
      ticket.subscriberName,
      ticket.mobileNumber,
      ticket.address,
      ticket.issueType,
      ticket.issueDescription,
      ticket.priority,
      ticket.remarks || '',
      ticket.status,
      '',
      '',
      '',
      now,
      now,
    ])
    addedCount++
  })

  logActivity(
    'repair',
    'Bulk Repair Tickets Added',
    addedCount + ' repair ticket(s) added via bulk upload',
    data.userId,
    data.userName
  )

  return jsonResponse({
    status: 'success',
    message: addedCount + ' repair tickets added successfully.',
    addedCount: addedCount,
    failedCount: failedCount,
  })
}

function getRepairTickets() {
  const sheet = getOrCreateSheet(REPAIRTICKETS_SHEET_NAME, REPAIRTICKETS_HEADERS)
  const rows = sheetRowsToObjects(sheet, REPAIRTICKETS_HEADERS)
  return jsonResponse({ status: 'ok', repairTickets: rows })
}

function getTechnicianRepairTickets(data) {
  const sheet = getOrCreateSheet(REPAIRTICKETS_SHEET_NAME, REPAIRTICKETS_HEADERS)
  const rows = sheetRowsToObjects(sheet, REPAIRTICKETS_HEADERS)
  const filtered = rows.filter((r) => r.assignedTechnicianId === String(data.technicianId))
  return jsonResponse({ status: 'ok', repairTickets: filtered })
}

function dispatchRepairTicket(data) {
  const sheet = getOrCreateSheet(REPAIRTICKETS_SHEET_NAME, REPAIRTICKETS_HEADERS)
  const rowIndex = findRowIndexById(sheet, data.repairTicketId)
  if (rowIndex === -1) {
    return jsonResponse({ status: 'error', message: 'Repair ticket not found.' })
  }

  const now = new Date().toISOString()
  setCell(sheet, rowIndex, REPAIRTICKETS_HEADERS, 'assignedTechnicianId', data.assignedTechnicianId || '')
  setCell(sheet, rowIndex, REPAIRTICKETS_HEADERS, 'assignedTechnicianName', data.assignedTechnicianName || '')
  setCell(sheet, rowIndex, REPAIRTICKETS_HEADERS, 'status', 'Dispatched')
  setCell(sheet, rowIndex, REPAIRTICKETS_HEADERS, 'dispatchDate', now)
  setCell(sheet, rowIndex, REPAIRTICKETS_HEADERS, 'updatedAt', now)

  logActivity(
    'repair',
    'Repair Ticket Dispatched',
    'Repair ticket ' + data.repairTicketId + ' dispatched to ' + data.assignedTechnicianName,
    data.assignedTechnicianId,
    data.assignedTechnicianName
  )
  return jsonResponse({ status: 'success' })
}

function moveRepairTicketTechnician(data) {
  const sheet = getOrCreateSheet(REPAIRTICKETS_SHEET_NAME, REPAIRTICKETS_HEADERS)
  const rowIndex = findRowIndexById(sheet, data.repairTicketId)
  if (rowIndex === -1) {
    return jsonResponse({ status: 'error', message: 'Repair ticket not found.' })
  }

  setCell(sheet, rowIndex, REPAIRTICKETS_HEADERS, 'assignedTechnicianId', data.assignedTechnicianId || '')
  setCell(sheet, rowIndex, REPAIRTICKETS_HEADERS, 'assignedTechnicianName', data.assignedTechnicianName || '')
  setCell(sheet, rowIndex, REPAIRTICKETS_HEADERS, 'updatedAt', new Date().toISOString())

  logActivity(
    'repair',
    'Repair Ticket Moved',
    'Repair ticket ' + data.repairTicketId + ' moved to ' + data.assignedTechnicianName,
    data.assignedTechnicianId,
    data.assignedTechnicianName
  )
  return jsonResponse({ status: 'success' })
}

function updateRepairStatus(data) {
  const sheet = getOrCreateSheet(REPAIRTICKETS_SHEET_NAME, REPAIRTICKETS_HEADERS)
  const rowIndex = findRowIndexById(sheet, data.repairTicketId)
  if (rowIndex === -1) {
    return jsonResponse({ status: 'error', message: 'Repair ticket not found.' })
  }

  setCell(sheet, rowIndex, REPAIRTICKETS_HEADERS, 'status', data.status)
  setCell(sheet, rowIndex, REPAIRTICKETS_HEADERS, 'updatedAt', new Date().toISOString())

  logActivity(
    'repair',
    'Repair Status Changed',
    'Repair ticket ' + data.repairTicketId + ' status changed to ' + data.status,
    '',
    ''
  )
  return jsonResponse({ status: 'success' })
}
