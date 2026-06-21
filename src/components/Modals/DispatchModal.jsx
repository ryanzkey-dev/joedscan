import { useState } from 'react'
import { X, UserCheck, ArrowRightLeft } from 'lucide-react'

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function DispatchModal({
  mode = 'assign', // 'assign' | 'move'
  title,
  details = [],
  currentTechnicianName,
  technicians,
  onConfirm,
  onClose,
}) {
  const [technicianId, setTechnicianId] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!technicianId) {
      setError('Please select a technician.')
      return
    }
    const technician = technicians.find((t) => t.id === technicianId)
    setSubmitting(true)
    setError('')
    try {
      await onConfirm(technician.id, technician.fullName, remarks)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            {mode === 'move' ? <ArrowRightLeft size={18} /> : <UserCheck size={18} />}
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 space-y-1 rounded-xl bg-gray-50 p-3 text-sm">
          {details.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-3">
              <span className="text-gray-500">{label}</span>
              <span className="text-right font-medium text-gray-800">{value || '—'}</span>
            </div>
          ))}
        </div>

        {mode === 'move' && currentTechnicianName && (
          <p className="mb-3 text-sm text-gray-500">
            Currently assigned to <span className="font-medium text-gray-800">{currentTechnicianName}</span>
          </p>
        )}

        {error && (
          <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {mode === 'move' ? 'New Technician' : 'Technician'} <span className="text-red-500">*</span>
            </label>
            <select
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              className={inputClasses}
            >
              <option value="">Select technician</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className={inputClasses}
              rows={2}
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Saving...' : mode === 'move' ? 'Confirm Move' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  )
}
