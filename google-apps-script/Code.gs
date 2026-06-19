const SHEET_NAME = 'Sheet1'

// Matches the existing header row in the spreadsheet exactly (column A through AM).
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

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  const data = JSON.parse(e.postData.contents)

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
  }

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

  return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(
    ContentService.MimeType.JSON
  )
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'Form to Sheets API is live' })
  ).setMimeType(ContentService.MimeType.JSON)
}
