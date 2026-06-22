import { useState } from 'react'
import { X } from 'lucide-react'

const STATUS_OPTIONS = ['Pending', 'Dispatched', 'In Progress', 'Completed', 'Rejected', 'Cancelled']

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function EditRawDataModal({ record, onSave, onClose }) {
  const [form, setForm] = useState({
    date: record.date || '',
    subscriber: record.subscriber || '',
    address: record.address || '',
    projectId: record.projectId || '',
    focPrefabSerial: record.focPrefabSerial || '',
    modem: record.modem || '',
    telset: record.telset || '',
    iptvCcaNo: record.iptvCcaNo || '',
    status: record.status || 'Pending',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Edit Raw Data — {record.id}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
            <input type="date" value={form.date} onChange={handleChange('date')} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Subscriber</label>
            <input
              type="text"
              value={form.subscriber}
              onChange={handleChange('subscriber')}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <input type="text" value={form.address} onChange={handleChange('address')} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Project ID</label>
            <input
              type="text"
              value={form.projectId}
              onChange={handleChange('projectId')}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">FOC Prefab</label>
            <input
              type="text"
              value={form.focPrefabSerial}
              onChange={handleChange('focPrefabSerial')}
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Modem</label>
              <input type="text" value={form.modem} onChange={handleChange('modem')} className={inputClasses} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Telset</label>
              <input type="text" value={form.telset} onChange={handleChange('telset')} className={inputClasses} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">IPTV CCA No.</label>
            <input
              type="text"
              value={form.iptvCcaNo}
              onChange={handleChange('iptvCcaNo')}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select value={form.status} onChange={handleChange('status')} className={inputClasses}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
