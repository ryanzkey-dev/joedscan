// Attendance module backend. Relies on getOrCreateSheet, sheetRowsToObjects, jsonResponse,
// nextSequentialId, logActivity — all defined in Code.gs / DispatchRepair.gs (same Apps
// Script project, shared global scope — no import needed).

const ATTENDANCE_SHEET_NAME = 'Attendance'
const ATTENDANCE_HEADERS = [
  'id',
  'technicianId',
  'technicianName',
  'date',
  'dispatchType',
  'dispatchOtherText',
  'timeIn',
  'timeInStatus',
  'lateMinutes',
  'latitude',
  'longitude',
  'locationAccuracy',
  'locationAddress',
  'attendanceImageUrl',
  'badWeatherProofUrl',
  'remarks',
  'createdAt',
  'updatedAt',
]

const ATTENDANCE_FOLDER_ID = '1gH-kevPQn_haxdZJ8Y6U40wZbpSY0re9'

function uploadBase64Image(base64Data, fileName) {
  if (!base64Data) return ''

  const folder = DriveApp.getFolderById(ATTENDANCE_FOLDER_ID)

  const contentTypeMatch = base64Data.match(/^data:(.*);base64,/)
  const contentType = contentTypeMatch ? contentTypeMatch[1] : 'image/jpeg'

  const bytes = Utilities.base64Decode(base64Data.split(',')[1])
  const blob = Utilities.newBlob(bytes, contentType, fileName)

  const file = folder.createFile(blob)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)

  return file.getUrl()
}

function routeAttendanceAction(action, data) {
  switch (action) {
    case 'addAttendance':
      return addAttendance(data)
    case 'getAttendances':
      return getAttendances()
    case 'getTechnicianAttendance':
      return getTechnicianAttendance(data)
    default:
      return jsonResponse({ status: 'error', message: 'Unknown action: ' + action })
  }
}

function addAttendance(data) {
  const sheet = getOrCreateSheet(ATTENDANCE_SHEET_NAME, ATTENDANCE_HEADERS)

  const existing = sheetRowsToObjects(sheet, ATTENDANCE_HEADERS)
  const duplicate = existing.some(
    (r) => r.technicianId === String(data.technicianId) && r.date === String(data.date)
  )
  if (duplicate) {
    return jsonResponse({ status: 'error', message: 'Attendance already submitted for today.' })
  }

  const attendanceImageUrl = uploadBase64Image(
    data.attendanceImageBase64,
    data.attendanceImageFileName || 'attendance-' + data.technicianId + '-' + data.date + '.jpg'
  )
  const badWeatherProofUrl = uploadBase64Image(
    data.badWeatherProofBase64,
    data.badWeatherProofFileName || 'proof-' + data.technicianId + '-' + data.date + '.jpg'
  )

  const id = nextSequentialId(sheet, 'ATT')
  const now = new Date().toISOString()

  sheet.appendRow([
    id,
    data.technicianId || '',
    data.technicianName || '',
    data.date || '',
    data.dispatchType || '',
    data.dispatchOtherText || '',
    data.timeIn || '',
    data.timeInStatus || '',
    data.lateMinutes || 0,
    data.latitude || '',
    data.longitude || '',
    data.locationAccuracy || '',
    data.locationAddress || '',
    attendanceImageUrl,
    badWeatherProofUrl,
    data.remarks || '',
    now,
    now,
  ])

  logActivity(
    'attendance',
    'Attendance Submitted',
    data.technicianName + ' submitted attendance for ' + data.date,
    data.technicianId,
    data.technicianName
  )

  return jsonResponse({
    status: 'success',
    message: 'Attendance submitted successfully.',
    id: id,
    attendanceImageUrl: attendanceImageUrl,
    badWeatherProofUrl: badWeatherProofUrl,
  })
}

function getAttendances() {
  const sheet = getOrCreateSheet(ATTENDANCE_SHEET_NAME, ATTENDANCE_HEADERS)
  const rows = sheetRowsToObjects(sheet, ATTENDANCE_HEADERS)
  return jsonResponse({ status: 'ok', attendances: rows })
}

function getTechnicianAttendance(data) {
  const sheet = getOrCreateSheet(ATTENDANCE_SHEET_NAME, ATTENDANCE_HEADERS)
  const rows = sheetRowsToObjects(sheet, ATTENDANCE_HEADERS)
  let filtered = rows.filter((r) => r.technicianId === String(data.technicianId))
  if (data.date) {
    filtered = filtered.filter((r) => r.date === String(data.date))
  }
  return jsonResponse({ status: 'ok', attendances: filtered })
}
