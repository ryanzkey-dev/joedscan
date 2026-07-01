// Install Raw Data module backend. Operates on the existing "Raw Data Install" sheet
// (the legacy installer report, renamed from "Sheet1") rather than a new sheet. Relies on
// getOrCreateSheet/jsonResponse from Code.gs (same Apps Script project, shared global
// scope — no import needed).
//
// This sheet has no id column and Column A starts directly at UPLOADED GEOTAGGING (no
// leading placeholder columns), so the actual Google Sheets row number (2, 3, 4, ...) is
// used to address rows for editing, returned to the frontend as _rowNumber — never written
// as a header, never displayed as a table column.
const INSTALL_RAW_DATA_SHEET = 'Raw Data Install'

const INSTALL_RAW_DATA_COLUMNS = [
  { key: 'uploadedGeotagging', header: 'UPLOADED GEOTAGGING' },
  { key: 'tms', header: 'TMS' },
  { key: 'ofsc', header: 'OFSC' },
  { key: 'remarks2', header: 'REMARKS 2' },
  { key: 'remarks3', header: 'REMARKS 3' },
  { key: 'month', header: 'MONTH' },
  { key: 'date', header: 'DATE' },
  { key: 'techNames', header: 'TECH NAMES' },
  { key: 'soType', header: 'SO TYPE' },
  { key: 'projectId', header: 'PROJECT ID' },
  { key: 'soVoice', header: 'SO VOICE' },
  { key: 'soData', header: 'SO DATA' },
  { key: 'soIptv', header: 'SO IPTV' },
  { key: 'subscriber', header: 'SUBSCRIBER' },
  { key: 'address', header: 'ADDRESS' },
  { key: 'cbr', header: 'CBR' },
  { key: 'tel', header: 'TEL' },
  { key: 'exchanged', header: 'EXCHANGED' },
  { key: 'cpeStatus', header: 'CPE STATUS' },
  { key: 'focPrefabSerial', header: 'FOC PREFAB SERIAL' },
  { key: 'modem', header: 'MODEM' },
  { key: 'telset', header: 'TELSET' },
  { key: 'iptvCcaNo', header: 'IPTV CCA NO' },
  { key: 'cafac', header: 'CAFAC' },
  { key: 'mhb', header: 'MHB' },
  { key: 'ioo', header: 'IOO' },
  { key: 'patch', header: 'PATCH' },
  { key: 'ojb', header: 'OJB' },
  { key: 'cableTie', header: 'CABLE TIE' },
  { key: 'fclip', header: 'FCLIP' },
  { key: 'fclamp', header: 'FCLAMP' },
  { key: 'fic', header: 'FIC' },
  { key: 'span', header: 'SPAN' },
  { key: 'meterStart', header: 'METER START' },
  { key: 'meterEnd', header: 'METER END' },
  { key: 'meterConsume', header: 'METER CONSUME' },
  { key: 'focType', header: 'FOC TYPE' },
]

const INSTALL_RAW_DATA_HEADERS = INSTALL_RAW_DATA_COLUMNS.map((col) => col.header)
const INSTALL_RAW_DATA_KEYS = INSTALL_RAW_DATA_COLUMNS.map((col) => col.key)

// Sheets auto-converts date-looking text into real Date cells. Force these two columns
// back to plain text whenever written, and format any Date objects encountered on read
// as a clean 'MMM dd, yyyy' string instead of a verbose GMT timestamp.
const INSTALL_RAW_DATA_TEXT_FORCED_KEYS = ['date', 'month']

function formatInstallRawDataCellForRead(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'MMM dd, yyyy')
  }
  return String(value)
}

function getInstallRawDataSheet() {
  return getOrCreateSheet(INSTALL_RAW_DATA_SHEET, INSTALL_RAW_DATA_HEADERS)
}

function routeInstallRawDataAction(action, data) {
  switch (action) {
    case 'getInstallRawData':
      return getInstallRawData()
    case 'updateInstallRawDataCell':
      return updateInstallRawDataCell(data)
    case 'updateInstallRawDataRow':
      return updateInstallRawDataRow(data)
    case 'bulkUpdateInstallRawData':
      return bulkUpdateInstallRawData(data)
    case 'addInstallRawDataRows':
      return addInstallRawDataRows(data)
    case 'addInstallRawDataRowAtTop':
      return addInstallRawDataRowAtTop(data)
    default:
      return jsonResponse({ status: 'error', message: 'Unknown action: ' + action })
  }
}

function getInstallRawData() {
  const sheet = getInstallRawDataSheet()
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return jsonResponse({ status: 'ok', rows: [] })

  const numRows = lastRow - 1
  const values = sheet.getRange(2, 1, numRows, INSTALL_RAW_DATA_KEYS.length).getValues()

  const rows = values
    .map((rowValues, i) => {
      const row = { _rowNumber: i + 2 }
      INSTALL_RAW_DATA_KEYS.forEach((key, colIndex) => {
        row[key] = formatInstallRawDataCellForRead(rowValues[colIndex])
      })
      return row
    })
    .filter((row) => Object.keys(row).some((key) => key !== '_rowNumber' && row[key] !== ''))

  return jsonResponse({ status: 'ok', rows })
}

function writeInstallRawDataField(sheet, rowNumber, key, value) {
  const colIndex = INSTALL_RAW_DATA_KEYS.indexOf(key)
  if (colIndex === -1) return
  const range = sheet.getRange(rowNumber, colIndex + 1)
  if (INSTALL_RAW_DATA_TEXT_FORCED_KEYS.indexOf(key) !== -1) {
    range.setNumberFormat('@')
  }
  range.setValue(value)
}

function updateInstallRawDataCell(data) {
  const sheet = getInstallRawDataSheet()
  if (INSTALL_RAW_DATA_KEYS.indexOf(data.field) === -1) {
    return jsonResponse({ status: 'error', message: 'Unknown field: ' + data.field })
  }
  writeInstallRawDataField(sheet, Number(data.rowNumber), data.field, data.value)
  return jsonResponse({ status: 'success' })
}

function updateInstallRawDataRow(data) {
  const sheet = getInstallRawDataSheet()
  const rowNumber = Number(data.rowNumber)
  const rowData = data.row || {}

  INSTALL_RAW_DATA_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(rowData, key)) {
      writeInstallRawDataField(sheet, rowNumber, key, rowData[key])
    }
  })

  return jsonResponse({ status: 'success' })
}

function bulkUpdateInstallRawData(data) {
  const sheet = getInstallRawDataSheet()
  const rows = data.rows || []

  rows.forEach((rowData) => {
    const rowNumber = Number(rowData._rowNumber)
    if (!rowNumber) return
    INSTALL_RAW_DATA_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(rowData, key)) {
        writeInstallRawDataField(sheet, rowNumber, key, rowData[key])
      }
    })
  })

  return jsonResponse({ status: 'success', updatedCount: rows.length })
}

// Inserts a new blank row directly after the header (row 2), shifting all existing
// data rows down by one. Returns the new row's sheet row number (always 2).
function addInstallRawDataRowAtTop(data) {
  const sheet = getInstallRawDataSheet()
  const rowData = data.row || {}

  sheet.insertRowAfter(1)

  const values = INSTALL_RAW_DATA_KEYS.map((key) => rowData[key] || '')
  sheet.getRange(2, 1, 1, values.length).setValues([values])

  INSTALL_RAW_DATA_TEXT_FORCED_KEYS.forEach((key) => {
    if (rowData[key]) {
      const colIndex = INSTALL_RAW_DATA_KEYS.indexOf(key)
      sheet.getRange(2, colIndex + 1).setNumberFormat('@').setValue(rowData[key])
    }
  })

  return jsonResponse({ status: 'success', rowNumber: 2 })
}

// Optional: run once from the Apps Script editor to add dropdown validation for Column A
// (UPLOADED GEOTAGGING) in Google Sheets. Not called automatically.
function applyUploadedGeotaggingValidation() {
  const sheet = getInstallRawDataSheet()
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(
      [
        'DONE UPLOAD',
        'PENDING',
        'REUSE',
        'VOICE & DATA ONLY',
        'MODIFY',
        'DATA ONLY',
        'DONE EMAIL',
        'NO IPTV S.O',
        'DONE UPLOAD GEOTAGGING',
        'NOT UPLOAD GEOTAGGING',
      ],
      true
    )
    .setAllowInvalid(false)
    .build()
  sheet.getRange('A2:A').setDataValidation(rule)
}

function addInstallRawDataRows(data) {
  const sheet = getInstallRawDataSheet()
  const rows = data.rows || []
  const rowNumbers = []

  rows.forEach((rowData) => {
    const rowValues = INSTALL_RAW_DATA_KEYS.map((key) => rowData[key] || '')
    sheet.appendRow(rowValues)
    const newRowNumber = sheet.getLastRow()

    INSTALL_RAW_DATA_TEXT_FORCED_KEYS.forEach((key) => {
      if (rowData[key]) {
        const colIndex = INSTALL_RAW_DATA_KEYS.indexOf(key)
        sheet.getRange(newRowNumber, colIndex + 1).setNumberFormat('@').setValue(rowData[key])
      }
    })

    rowNumbers.push(newRowNumber)
  })

  return jsonResponse({ status: 'success', rowNumbers: rowNumbers })
}
