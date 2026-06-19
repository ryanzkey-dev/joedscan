const SHEET_NAME = 'Sheet1'

const HEADERS = [
  'Date',
  'Tech Names',
  'Project ID',
  'Subscriber',
  'Address',
  'FOC Traditional / Prefab Serial',
  'Modem',
  'Telset',
  'IPTV CCA No.',
  'Start Latitude',
  'Start Longitude',
  'End Latitude',
  'End Longitude',
  'Distance (m)',
  'Distance (km)',
  'Submitted At',
]

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  const data = JSON.parse(e.postData.contents)

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
  }

  sheet.appendRow([
    data.date || '',
    data.techNames || '',
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
    new Date().toISOString(),
  ])

  return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(
    ContentService.MimeType.JSON
  )
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'Form to Sheets API is live' })
  ).setMimeType(ContentService.MimeType.JSON)
}
