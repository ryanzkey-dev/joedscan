import { useState } from 'react'
import { X } from 'lucide-react'

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function EditMaterialCatalogModal({ material, onSave, onClose }) {
  const [materialName, setMaterialName] = useState(material.materialName)
  const [requiresScanner, setRequiresScanner] = useState(material.requiresScanner)
  const [status, setStatus] = useState(material.status)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!materialName.trim()) {
      setError('Material Name is required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSave({ materialName: materialName.trim(), requiresScanner, status })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Edit Material</h3>
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Material Name</label>
            <input
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Scanner Required</label>
            <select value={requiresScanner} onChange={(e) => setRequiresScanner(e.target.value)} className={inputClasses}>
              <option value="Yes">With Scanner</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClasses}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
