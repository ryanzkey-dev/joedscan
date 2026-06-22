// "Manila wall-clock as local" trick: reparsing the Asia/Manila-formatted string as a new
// Date makes its getHours()/getDate()/etc. report Manila wall-clock values regardless of the
// device's actual timezone, so ordinary Date methods (setHours, toLocaleDateString without a
// timeZone option, etc.) all just work against Manila time from here on.
export function getManilaTimeNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }))
}

const LATE_CUTOFF_HOUR = 7
const LATE_CUTOFF_MINUTE = 30

export function computeLateMinutes(timeInDate) {
  const cutoff = new Date(timeInDate)
  cutoff.setHours(LATE_CUTOFF_HOUR, LATE_CUTOFF_MINUTE, 0, 0)

  const diffMs = timeInDate - cutoff
  return Math.max(0, Math.floor(diffMs / 60000))
}

export function formatDisplayDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export function formatDisplayTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toTimeKey(date) {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}
