import { X, ExternalLink } from 'lucide-react'
import { formatDisplayDate } from '../../utils/manilaTime'

export default function AttendanceDetailsModal({ record, onClose }) {
  const mapsUrl = `https://www.google.com/maps?q=${record.latitude},${record.longitude}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Attendance Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Date</dt>
            <dd className="font-medium text-gray-800">
              {record.date ? formatDisplayDate(new Date(record.date)) : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Technician Name</dt>
            <dd className="font-medium text-gray-800">{record.technicianName}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Dispatch Type</dt>
            <dd className="font-medium text-gray-800">{record.dispatchType}</dd>
          </div>
          {record.dispatchType === 'Other' && (
            <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Other Dispatch Text</dt>
              <dd className="font-medium text-gray-800">{record.dispatchOtherText}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Time In</dt>
            <dd className="font-medium text-gray-800">{record.timeIn}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Time In Status</dt>
            <dd className="font-medium text-gray-800">{record.timeInStatus}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Late Minutes</dt>
            <dd className="font-medium text-gray-800">
              {record.timeInStatus === 'Late' ? `${record.lateMinutes} minutes` : '-'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Latitude</dt>
            <dd className="font-medium text-gray-800">{record.latitude}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Longitude</dt>
            <dd className="font-medium text-gray-800">{record.longitude}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Accuracy</dt>
            <dd className="font-medium text-gray-800">{record.locationAccuracy ? `±${record.locationAccuracy}m` : '—'}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Google Maps Link</dt>
            <dd>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-medium text-orange-700 underline"
              >
                View Map <ExternalLink size={12} />
              </a>
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Remarks</dt>
            <dd className="font-medium text-gray-800">{record.remarks || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Created At</dt>
            <dd className="font-medium text-gray-800">
              {record.createdAt ? new Date(record.createdAt).toLocaleString() : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 pb-2">
            <dt className="text-gray-500">Updated At</dt>
            <dd className="font-medium text-gray-800">
              {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : '—'}
            </dd>
          </div>
        </dl>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Attendance Image</p>
            {record.attendanceImageUrl ? (
              <a href={record.attendanceImageUrl} target="_blank" rel="noreferrer">
                <img
                  src={record.attendanceImageUrl}
                  alt="Attendance"
                  className="h-32 w-full rounded-lg border border-gray-200 object-cover"
                />
              </a>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                No Photo
              </div>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Proof Image</p>
            {record.badWeatherProofUrl ? (
              <a href={record.badWeatherProofUrl} target="_blank" rel="noreferrer">
                <img
                  src={record.badWeatherProofUrl}
                  alt="Proof"
                  className="h-32 w-full rounded-lg border border-gray-200 object-cover"
                />
              </a>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                No Proof
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
