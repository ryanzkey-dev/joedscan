import { useEffect, useMemo, useState } from 'react'
import { Clock, MapPin, CheckCircle, AlertTriangle } from 'lucide-react'
import AttendancePhotoCapture from '../../components/Attendance/AttendancePhotoCapture'
import { useAuth } from '../../context/useAuth'
import { apiRequest } from '../../utils/sheetsApi'
import {
  getManilaTimeNow,
  computeLateMinutes,
  formatDisplayDate,
  formatDisplayTime,
  toDateKey,
  toTimeKey,
} from '../../utils/manilaTime'

const DISPATCH_OPTIONS = ['WAR', 'PR', 'Other']

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function Attendance() {
  const { user } = useAuth()
  const today = useMemo(() => getManilaTimeNow(), [])
  const todayKey = toDateKey(today)

  const [checking, setChecking] = useState(true)
  const [alreadySubmitted, setAlreadySubmitted] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [dispatchType, setDispatchType] = useState('')
  const [dispatchOtherText, setDispatchOtherText] = useState('')
  const [timeInDate, setTimeInDate] = useState(null)
  const [timeInStatus, setTimeInStatus] = useState('')
  const [lateMinutes, setLateMinutes] = useState(0)

  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')

  const [attendanceImage, setAttendanceImage] = useState({ dataUrl: '', fileName: '' })
  const [badWeatherProof, setBadWeatherProof] = useState({ dataUrl: '', fileName: '' })
  const [remarks, setRemarks] = useState('')

  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const requestLocation = () => {
    setLocationError('')
    if (!navigator.geolocation) {
      setLocationError('Location permission is required for attendance.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy),
        })
      },
      () => {
        setLocationError('Location permission is required for attendance.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    requestLocation()

    apiRequest('getTechnicianAttendance', { technicianId: user.id, date: todayKey })
      .then((res) => {
        const record = (res.attendances || [])[0]
        if (record) setAlreadySubmitted(record)
      })
      .catch((err) => setError(err.message))
      .finally(() => setChecking(false))
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleTimeIn = () => {
    const now = getManilaTimeNow()
    const minutes = computeLateMinutes(now)
    setTimeInDate(now)
    setLateMinutes(minutes)
    setTimeInStatus(minutes > 0 ? 'Late' : 'On Time')
  }

  const dispatchLabel = dispatchType === 'Other' ? dispatchOtherText || 'Other' : dispatchType

  const overlayLines = [
    `Technician: ${user.fullName}`,
    `Date: ${formatDisplayDate(today)}`,
    `Time In: ${timeInDate ? formatDisplayTime(timeInDate) : '-'}`,
    `Lat: ${location?.latitude || '-'}`,
    `Lng: ${location?.longitude || '-'}`,
    `Dispatch: ${dispatchLabel || '-'}`,
  ]

  const photoEnabled = Boolean(dispatchType && (dispatchType !== 'Other' || dispatchOtherText.trim()) && timeInDate && location)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!dispatchType) next.dispatchType = 'Dispatch is required'
    if (dispatchType === 'Other' && !dispatchOtherText.trim()) {
      next.dispatchOtherText = 'Please specify dispatch type'
    }
    if (!timeInDate) next.timeIn = 'Time In is required'
    if (!location) next.location = 'GPS location is required'
    if (!attendanceImage.dataUrl) next.attendanceImage = 'Picture with timestamp and location is required'

    setFormErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    setError('')
    try {
      const res = await apiRequest('addAttendance', {
        technicianId: user.id,
        technicianName: user.fullName,
        date: todayKey,
        dispatchType,
        dispatchOtherText: dispatchType === 'Other' ? dispatchOtherText.trim() : '',
        timeIn: toTimeKey(timeInDate),
        timeInStatus,
        lateMinutes,
        latitude: location.latitude,
        longitude: location.longitude,
        locationAccuracy: location.accuracy,
        attendanceImageBase64: attendanceImage.dataUrl,
        attendanceImageFileName: attendanceImage.fileName,
        badWeatherProofBase64: badWeatherProof.dataUrl,
        badWeatherProofFileName: badWeatherProof.fileName,
        remarks: remarks.trim(),
      })
      setSuccess(true)
      setAlreadySubmitted({
        date: todayKey,
        dispatchType,
        dispatchOtherText,
        timeIn: toTimeKey(timeInDate),
        timeInStatus,
        lateMinutes,
        latitude: location.latitude,
        longitude: location.longitude,
        attendanceImageUrl: res.attendanceImageUrl,
        badWeatherProofUrl: res.badWeatherProofUrl,
        remarks: remarks.trim(),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
  }

  if (alreadySubmitted) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Attendance</h1>

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <CheckCircle size={18} />
            Attendance submitted successfully.
          </div>
        )}

        <div className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            You already submitted attendance for {formatDisplayDate(today)}.
          </p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Dispatch</dt>
              <dd className="font-medium text-gray-800">
                {alreadySubmitted.dispatchType === 'Other'
                  ? alreadySubmitted.dispatchOtherText
                  : alreadySubmitted.dispatchType}
              </dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Time In</dt>
              <dd className="font-medium text-gray-800">{alreadySubmitted.timeIn}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Status</dt>
              <dd>
                {alreadySubmitted.timeInStatus === 'Late' ? (
                  <span className="animate-pulse rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    LATE - {alreadySubmitted.lateMinutes} MINUTES
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    ON TIME
                  </span>
                )}
              </dd>
            </div>
          </dl>
          {alreadySubmitted.attendanceImageUrl && (
            <a
              href={alreadySubmitted.attendanceImageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm font-medium text-orange-700 underline"
            >
              View submitted photo
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Attendance</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
          <input type="text" readOnly value={formatDisplayDate(today)} className={`${inputClasses} cursor-not-allowed bg-gray-50`} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Dispatch <span className="text-red-500">*</span>
          </label>
          <select value={dispatchType} onChange={(e) => setDispatchType(e.target.value)} className={inputClasses}>
            <option value="">Select dispatch type</option>
            {DISPATCH_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {formErrors.dispatchType && <p className="mt-1 text-xs text-red-600">{formErrors.dispatchType}</p>}

          {dispatchType === 'Other' && (
            <div className="mt-2">
              <input
                type="text"
                value={dispatchOtherText}
                onChange={(e) => setDispatchOtherText(e.target.value)}
                placeholder="Please specify dispatch type"
                className={inputClasses}
              />
              {formErrors.dispatchOtherText && (
                <p className="mt-1 text-xs text-red-600">{formErrors.dispatchOtherText}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Time In</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTimeIn}
              disabled={Boolean(timeInDate)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Clock size={16} />
              {timeInDate ? 'Timed In' : 'Time In'}
            </button>
            {timeInDate && <span className="text-sm font-medium text-gray-700">{formatDisplayTime(timeInDate)}</span>}
            {timeInStatus === 'Late' && (
              <span className="animate-pulse rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                LATE - {lateMinutes} MINUTES
              </span>
            )}
            {timeInStatus === 'On Time' && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">ON TIME</span>
            )}
          </div>
          {formErrors.timeIn && <p className="mt-1 text-xs text-red-600">{formErrors.timeIn}</p>}
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <MapPin size={14} /> Location
          </label>
          {location ? (
            <p className="text-sm text-gray-600">
              {location.latitude}, {location.longitude} (±{location.accuracy}m)
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-amber-600">{locationError || 'Detecting location...'}</p>
              {locationError && (
                <button
                  type="button"
                  onClick={requestLocation}
                  className="text-xs font-medium text-orange-700 underline"
                >
                  Retry location
                </button>
              )}
            </div>
          )}
          {formErrors.location && <p className="mt-1 text-xs text-red-600">{formErrors.location}</p>}
        </div>

        <AttendancePhotoCapture
          label="Picture with Timestamp and Location"
          overlayLines={overlayLines}
          disabled={!photoEnabled}
          onCaptured={(dataUrl, fileName) => setAttendanceImage({ dataUrl, fileName })}
        />
        {formErrors.attendanceImage && <p className="text-xs text-red-600">{formErrors.attendanceImage}</p>}

        <AttendancePhotoCapture
          label="Proof Bad Weather or Emergency (optional)"
          overlayLines={[`${formatDisplayDate(today)}`, 'Bad Weather / Emergency Proof']}
          onCaptured={(dataUrl, fileName) => setBadWeatherProof({ dataUrl, fileName })}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputClasses} rows={2} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 py-3 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
