const SHEET_NAME = 'Sheet1'
const TECHNICIAN_SHEET_NAME = 'Technician'
const TRANSACTIONS_SHEET_NAME = 'Transactions'

// Matches the existing header row in the spreadsheet exactly (column A through AM).
// This is the legacy installer report layout — write-only from this app, untouched on read.
const HEADERS = [
  '3',
  '',
  'UPLOADED GEOTAGGING',
  'TMS',
  'OFSC',
  'REMARKS 2',
  'REMARKS 3',
  'MONTH',
  'DATE',
  'TECH NAMES',
  'SO TYPE',
  'PROJECT ID',
  'SO VOICE',
  'SO DATA',
  'SO  IPTV',
  'SUBSCRIBER',
  'ADDRESS',
  'CBR',
  'TEL',
  'EXCHANGED',
  'CPE STATUS',
  'FOC PREFAB SERIAL',
  'MODEM',
  'TELSET',
  'IPTV CCA NO',
  'CAFAC',
  'MHB',
  'IOO',
  'PATCH',
  'OJB',
  'CABLE TIE',
  'FCLIP',
  'FCLAMP',
  'FIC',
  'SPAN',
  'METER START',
  'METER END',
  'METER CONSUME',
  'FOC TYPE',
]

const TECHNICIAN_HEADERS = ['Technician ID', 'Full Name', 'Address', 'Username', 'Password', 'Created At']

const TRANSACTIONS_HEADERS = [
  'Transaction ID',
  'Technician ID',
  'Technician Name',
  'Date',
  'Project ID',
  'Subscriber',
  'Address',
  'FOC Prefab Serial',
  'Modem',
  'Telset',
  'IPTV CCA No',
  'Start Latitude',
  'Start Longitude',
  'End Latitude',
  'End Longitude',
  'Distance Meters',
  'Distance Kilometers',
  'Status',
  'Created At',
]

function buildGeotagSummary(data) {
  const parts = []
  if (data.startLatitude && data.startLongitude) {
    parts.push('Start: ' + data.startLatitude + ', ' + data.startLongitude)
  }
  if (data.endLatitude && data.endLongitude) {
    parts.push('End: ' + data.endLatitude + ', ' + data.endLongitude)
  }
  if (data.distanceMeters) {
    parts.push('Distance: ' + data.distanceMeters + 'm (' + data.distanceKilometers + 'km)')
  }
  return parts.join(' | ')
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(name)
  if (!sheet) {
    sheet = ss.insertSheet(name)
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers)
  }
  return sheet
}

function sheetRowsToObjects(sheet, keys) {
  if (sheet.getLastRow() < 2) return []
  const numRows = sheet.getLastRow() - 1
  const values = sheet.getRange(2, 1, numRows, keys.length).getValues()
  return values
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => {
      const obj = {}
      keys.forEach((key, i) => {
        obj[key] = row[i] instanceof Date ? row[i].toISOString() : String(row[i])
      })
      return obj
    })
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  )
}

function nextSequentialId(sheet, prefix) {
  // Header row counts as row 1, so getLastRow() before appending is exactly
  // the right next sequence number (1 for the first data row, etc).
  return prefix + '-' + String(sheet.getLastRow()).padStart(3, '0')
}

function saveTechnician(data) {
  const sheet = getOrCreateSheet(TECHNICIAN_SHEET_NAME, TECHNICIAN_HEADERS)
  const id = nextSequentialId(sheet, 'TECH')

  sheet.appendRow([
    id,
    data.fullName || '',
    data.address || '',
    data.username || '',
    data.password || '',
    data.createdAt || new Date().toISOString(),
  ])

  return jsonResponse({ status: 'success', id })
}

function saveInstallerRecord(data) {
  const sheet = getOrCreateSheet(SHEET_NAME, HEADERS)

  sheet.appendRow([
    '', // 3 (unused index column)
    '', // (blank column)
    buildGeotagSummary(data), // UPLOADED GEOTAGGING
    '', // TMS
    '', // OFSC
    '', // REMARKS 2
    '', // REMARKS 3
    '', // MONTH
    data.date || '',
    data.techNames || '',
    '', // SO TYPE
    data.projectId || '',
    '', // SO VOICE
    '', // SO DATA
    '', // SO  IPTV
    data.subscriber || '',
    data.address || '',
    '', // CBR
    '', // TEL
    '', // EXCHANGED
    '', // CPE STATUS
    data.focPrefabSerial || '',
    data.modem || '',
    data.telset || '',
    data.iptvCcaNo || '',
    '', // CAFAC
    '', // MHB
    '', // IOO
    '', // PATCH
    '', // OJB
    '', // CABLE TIE
    '', // FCLIP
    '', // FCLAMP
    '', // FIC
    '', // SPAN
    '', // METER START
    '', // METER END
    '', // METER CONSUME
    '', // FOC TYPE
  ])
}

function saveTransactionRecord(data) {
  const sheet = getOrCreateSheet(TRANSACTIONS_SHEET_NAME, TRANSACTIONS_HEADERS)
  const id = nextSequentialId(sheet, 'TRX')

  sheet.appendRow([
    id,
    data.technicianId || '',
    data.technicianName || '',
    data.date || '',
    data.projectId || '',
    data.subscriber || '',
    data.address || '',
    data.focPrefabSerial || '',
    data.modem || '',
    data.telset || '',
    data.iptvCcaNo || '',
    data.startLatitude || '',
    data.startLongitude || '',
    data.endLatitude || '',
    data.endLongitude || '',
    data.distanceMeters || '',
    data.distanceKilometers || '',
    data.status || 'Pending',
    data.createdAt || new Date().toISOString(),
  ])

  return id
}

function saveEncoding(data) {
  saveInstallerRecord(data)
  const id = saveTransactionRecord(data)
  return jsonResponse({ status: 'success', id })
}

function updateTransactionStatus(data) {
  const sheet = getOrCreateSheet(TRANSACTIONS_SHEET_NAME, TRANSACTIONS_HEADERS)
  const idColumn = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 0), 1).getValues()
  const statusColumnIndex = TRANSACTIONS_HEADERS.indexOf('Status') + 1

  for (let i = 0; i < idColumn.length; i++) {
    if (String(idColumn[i][0]) === String(data.id)) {
      sheet.getRange(i + 2, statusColumnIndex).setValue(data.status)
      return jsonResponse({ status: 'success' })
    }
  }

  return jsonResponse({ status: 'error', message: 'Transaction ID not found.' })
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents)

  if (data.formType === 'technician') {
    return saveTechnician(data)
  }
  if (data.formType === 'updateStatus') {
    return updateTransactionStatus(data)
  }
  if (data.formType === 'encoding') {
    return saveEncoding(data)
  }

  // Backwards compatibility for older clients without formType.
  saveInstallerRecord(data)
  return jsonResponse({ status: 'success' })
}

function doGet() {
  const technicianSheet = getOrCreateSheet(TECHNICIAN_SHEET_NAME, TECHNICIAN_HEADERS)
  const transactionsSheet = getOrCreateSheet(TRANSACTIONS_SHEET_NAME, TRANSACTIONS_HEADERS)

  const technicianRows = sheetRowsToObjects(technicianSheet, [
    'id',
    'fullName',
    'address',
    'username',
    'password',
    'createdAt',
  ])

  const transactionRows = sheetRowsToObjects(transactionsSheet, [
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

  return jsonResponse({
    status: 'ok',
    technicians: technicianRows,
    transactions: transactionRows,
  })
}
