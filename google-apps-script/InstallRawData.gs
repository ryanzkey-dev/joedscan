// Install Raw Data module backend. Operates on the existing legacy installer report sheet
// (renamed from "Sheet1" to "Raw Data Install" in the spreadsheet) rather than a new sheet
// — its header row already matches this exact column layout (previously write-only via
// saveInstallerRecord in Code.gs). Relies on getOrCreateSheet/jsonResponse from Code.gs
// (same Apps Script project, shared global scope — no import needed). HEADERS (the header
// row array) is also defined in Code.gs and reused as-is; only the sheet name is its own
// constant here so this module isn't implicitly coupled to Code.gs's SHEET_NAME.
const INSTALL_RAW_DATA_SHEET = 'Raw Data Install'

// This sheet has no id column, so the actual sheet row number (2, 3, 4, ...) is used as the
// row id everywhere here — simplest way to address rows for editing without changing the
// existing column layout other flows (saveInstallerRecord) already write into positionally.

// Mirrors HEADERS' column order exactly. The first two columns ('3' and a blank header)
// are legacy/unused, kept as '_' placeholders so positions still line up.
const INSTALL_RAW_DATA_KEYS = [
  '_col1',
  '_col2',
  'uploadedGeotagging',
  'tms',
  'ofsc',
  'remarks2',
  'remarks3',
  'month',
  'date',
  'techNames',
  'soType',
  'projectId',
  'soVoice',
  'soData',
  'soIptv',
  'subscriber',
  'address',
  'cbr',
  'tel',
  'exchanged',
  'cpeStatus',
  'focPrefabSerial',
  'modem',
  'telset',
  'iptvCcaNo',
  'cafac',
  'mhb',
  'ioo',
  'patch',
  'ojb',
  'cableTie',
  'fclip',
  'fclamp',
  'fic',
  'span',
  'meterStart',
  'meterEnd',
  'meterConsume',
  'focType',
]

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
    default:
      return jsonResponse({ status: 'error', message: 'Unknown action: ' + action })
  }
}

function getInstallRawData() {
  const sheet = getOrCreateSheet(INSTALL_RAW_DATA_SHEET, HEADERS)
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return jsonResponse({ status: 'ok', rows: [] })

  const numRows = lastRow - 1
  const values = sheet.getRange(2, 1, numRows, INSTALL_RAW_DATA_KEYS.length).getValues()

  const rows = values
    .map((rowValues, i) => {
      const row = { id: i + 2 }
      INSTALL_RAW_DATA_KEYS.forEach((key, colIndex) => {
        if (key.indexOf('_') === 0) return
        row[key] = formatInstallRawDataCellForRead(rowValues[colIndex])
      })
      return row
    })
    .filter((row) => Object.keys(row).some((key) => key !== 'id' && row[key] !== ''))

  return jsonResponse({ status: 'ok', rows })
}

function writeInstallRawDataField(sheet, rowIndex, key, value) {
  const colIndex = INSTALL_RAW_DATA_KEYS.indexOf(key)
  if (colIndex === -1) return
  const range = sheet.getRange(rowIndex, colIndex + 1)
  if (INSTALL_RAW_DATA_TEXT_FORCED_KEYS.indexOf(key) !== -1) {
    range.setNumberFormat('@')
  }
  range.setValue(value)
}

function updateInstallRawDataCell(data) {
  const sheet = getOrCreateSheet(INSTALL_RAW_DATA_SHEET, HEADERS)
  if (INSTALL_RAW_DATA_KEYS.indexOf(data.field) === -1) {
    return jsonResponse({ status: 'error', message: 'Unknown field: ' + data.field })
  }
  writeInstallRawDataField(sheet, Number(data.id), data.field, data.value)
  return jsonResponse({ status: 'success' })
}

function updateInstallRawDataRow(data) {
  const sheet = getOrCreateSheet(INSTALL_RAW_DATA_SHEET, HEADERS)
  const rowIndex = Number(data.id)
  const rowData = data.row || {}

  INSTALL_RAW_DATA_KEYS.forEach((key) => {
    if (key.indexOf('_') === 0) return
    if (Object.prototype.hasOwnProperty.call(rowData, key)) {
      writeInstallRawDataField(sheet, rowIndex, key, rowData[key])
    }
  })

  return jsonResponse({ status: 'success' })
}

function bulkUpdateInstallRawData(data) {
  const sheet = getOrCreateSheet(INSTALL_RAW_DATA_SHEET, HEADERS)
  const rows = data.rows || []

  rows.forEach((rowData) => {
    const rowIndex = Number(rowData.id)
    if (!rowIndex) return
    INSTALL_RAW_DATA_KEYS.forEach((key) => {
      if (key.indexOf('_') === 0) return
      if (Object.prototype.hasOwnProperty.call(rowData, key)) {
        writeInstallRawDataField(sheet, rowIndex, key, rowData[key])
      }
    })
  })

  return jsonResponse({ status: 'success', updatedCount: rows.length })
}

function addInstallRawDataRows(data) {
  const sheet = getOrCreateSheet(INSTALL_RAW_DATA_SHEET, HEADERS)
  const rows = data.rows || []
  const ids = []

  rows.forEach((rowData) => {
    const rowValues = INSTALL_RAW_DATA_KEYS.map((key) =>
      key.indexOf('_') === 0 ? '' : rowData[key] || ''
    )
    sheet.appendRow(rowValues)
    const newRowIndex = sheet.getLastRow()

    INSTALL_RAW_DATA_TEXT_FORCED_KEYS.forEach((key) => {
      if (rowData[key]) {
        const colIndex = INSTALL_RAW_DATA_KEYS.indexOf(key)
        sheet.getRange(newRowIndex, colIndex + 1).setNumberFormat('@').setValue(rowData[key])
      }
    })

    ids.push(newRowIndex)
  })

  return jsonResponse({ status: 'success', ids: ids })
}
