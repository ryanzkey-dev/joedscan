import { useEffect, useState } from 'react'
import { Plus, Eye, Pencil, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import DataTable from '../../../components/Tables/DataTable'
import StatusBadge from '../../../components/Tables/StatusBadge'
import RecordDetailsModal from '../../../components/Modals/RecordDetailsModal'
import EditMaterialCatalogModal from '../../../components/Modals/EditMaterialCatalogModal'
import { useAuth } from '../../../context/useAuth'
import { apiRequest } from '../../../utils/sheetsApi'

const initialForm = { materialName: '', requiresScanner: 'No' }

export default function AddMaterials() {
  const { user } = useAuth()
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiRequest('getMaterialCatalog')
      setCatalog(res.materialCatalog || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.materialName.trim()) next.materialName = 'Material Name is required'
    setFormErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    setError('')
    try {
      await apiRequest('addMaterialCatalog', {
        materialName: form.materialName.trim(),
        requiresScanner: form.requiresScanner,
        userId: user.id,
        userName: user.fullName,
      })
      await load()
      setForm(initialForm)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveEdit = async (updates) => {
    await apiRequest('updateMaterialCatalog', { id: editing.id, ...updates, userId: user.id, userName: user.fullName })
    await load()
    setEditing(null)
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await apiRequest('deleteMaterialCatalog', { id, userId: user.id, userName: user.fullName })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const columns = [
    { key: 'id', label: 'Material ID' },
    { key: 'materialName', label: 'Material Name' },
    { key: 'requiresScanner', label: 'Scanner Required' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setViewing({
                title: 'Material Details',
                details: [
                  { label: 'Material ID', value: row.id },
                  { label: 'Material Name', value: row.materialName },
                  { label: 'Scanner Required', value: row.requiresScanner },
                  { label: 'Status', value: row.status },
                  { label: 'Created At', value: new Date(row.createdAt).toLocaleString() },
                ],
              })
            }
            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
            aria-label="View material"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={() => setEditing(row)}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
            aria-label="Edit material"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="rounded-lg border border-gray-200 p-1.5 text-red-600 hover:bg-red-50"
            aria-label="Deactivate material"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Add Materials</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          Material added successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Material Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.materialName}
              onChange={(e) => setForm((prev) => ({ ...prev, materialName: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            {formErrors.materialName && (
              <p className="mt-1 text-xs text-red-600">{formErrors.materialName}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Scanner Option</label>
            <div className="flex gap-4 pt-2.5">
              <label className="flex items-center gap-1.5 text-sm text-gray-700">
                <input
                  type="radio"
                  name="requiresScanner"
                  checked={form.requiresScanner === 'Yes'}
                  onChange={() => setForm((prev) => ({ ...prev, requiresScanner: 'Yes' }))}
                />
                With Scanner
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-700">
                <input
                  type="radio"
                  name="requiresScanner"
                  checked={form.requiresScanner === 'No'}
                  onChange={() => setForm((prev) => ({ ...prev, requiresScanner: 'No' }))}
                />
                No
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 px-5 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Plus size={18} />
          {submitting ? 'Adding...' : 'Add Material'}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
      ) : (
        <DataTable columns={columns} rows={catalog} />
      )}

      {viewing && (
        <RecordDetailsModal title={viewing.title} details={viewing.details} onClose={() => setViewing(null)} />
      )}

      {editing && (
        <EditMaterialCatalogModal material={editing} onSave={handleSaveEdit} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
