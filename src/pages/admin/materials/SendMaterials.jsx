import { useEffect, useMemo, useState } from 'react'
import { Send, Eye, AlertCircle, CheckCircle2, Search } from 'lucide-react'
import DataTable from '../../../components/Tables/DataTable'
import StatusBadge from '../../../components/Tables/StatusBadge'
import RecordDetailsModal from '../../../components/Modals/RecordDetailsModal'
import SerialNumberInputs from '../../../components/Materials/SerialNumberInputs'
import { useAuth } from '../../../context/useAuth'
import { apiRequest } from '../../../utils/sheetsApi'

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

const initialForm = {
  technicianId: '',
  catalogId: '',
  quantity: 1,
  unit: '',
  pcs: '',
  remarks: '',
}

export default function SendMaterials() {
  const { user } = useAuth()
  const [technicians, setTechnicians] = useState([])
  const [catalog, setCatalog] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState(initialForm)
  const [serialNumbers, setSerialNumbers] = useState([''])
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [search, setSearch] = useState('')
  const [technicianFilter, setTechnicianFilter] = useState('All')
  const [materialFilter, setMaterialFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewing, setViewing] = useState(null)

  const selectedMaterial = catalog.find((m) => m.id === form.catalogId)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [techRes, catalogRes, txRes] = await Promise.all([
        apiRequest('getTechnicians'),
        apiRequest('getMaterialCatalog'),
        apiRequest('getMaterialTransactions', { transactionType: 'SEND_TO_TECHNICIAN' }),
      ])
      setTechnicians(techRes.technicians || [])
      setCatalog((catalogRes.materialCatalog || []).filter((m) => m.status !== 'Inactive'))
      setTransactions(txRes.materialTransactions || [])
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

  const handleMaterialChange = (catalogId) => {
    setForm((prev) => ({ ...prev, catalogId }))
    setSerialNumbers([''])
  }

  const handleQuantityChange = (value) => {
    const qty = Math.max(1, Number(value) || 1)
    setForm((prev) => ({ ...prev, quantity: qty }))
    if (selectedMaterial?.requiresScanner === 'Yes') {
      setSerialNumbers((prev) => {
        const next = [...prev]
        while (next.length < qty) next.push('')
        return next.slice(0, qty)
      })
    }
  }

  const handleSerialChange = (index, value) => {
    setSerialNumbers((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const technician = technicians.find((t) => t.id === form.technicianId)
    const next = {}
    if (!form.technicianId) next.technicianId = 'Select a technician'
    if (!form.catalogId) next.catalogId = 'Select a material'
    if (!form.quantity || form.quantity <= 0) next.quantity = 'Quantity must be greater than 0'
    if (!form.unit.trim()) next.unit = 'Unit is required'
    if (!form.pcs.trim()) next.pcs = 'PCS is required'

    if (selectedMaterial?.requiresScanner === 'Yes') {
      const trimmed = serialNumbers.map((s) => s.trim())
      if (trimmed.length !== form.quantity || trimmed.some((s) => !s)) {
        next.serialNumbers = 'Enter a serial number for each unit'
      } else if (new Set(trimmed).size !== trimmed.length) {
        next.serialNumbers = 'Serial numbers must be unique'
      }
    }

    setFormErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    setError('')
    try {
      await apiRequest('sendMaterialsToTechnician', {
        technicianId: technician.id,
        technicianName: technician.fullName,
        catalogId: form.catalogId,
        materialName: selectedMaterial.materialName,
        requiresScanner: selectedMaterial.requiresScanner,
        quantity: form.quantity,
        unit: form.unit.trim(),
        pcs: form.pcs.trim(),
        serialNumbers: serialNumbers.map((s) => s.trim()),
        remarks: form.remarks.trim(),
        userId: user.id,
        userName: user.fullName,
      })
      await load()
      setForm(initialForm)
      setSerialNumbers([''])
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredHistory = useMemo(() => {
    const term = search.trim().toLowerCase()
    return transactions.filter((t) => {
      const matchesSearch =
        !term ||
        t.materialName?.toLowerCase().includes(term) ||
        t.serialNumber?.toLowerCase().includes(term) ||
        t.toOwnerName?.toLowerCase().includes(term) ||
        t.status?.toLowerCase().includes(term)
      const matchesTechnician = technicianFilter === 'All' || t.toOwnerId === technicianFilter
      const matchesMaterial = materialFilter === 'All' || t.catalogId === materialFilter
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter
      return matchesSearch && matchesTechnician && matchesMaterial && matchesStatus
    })
  }, [transactions, search, technicianFilter, materialFilter, statusFilter])

  const historyColumns = [
    { key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'materialName', label: 'Material Name' },
    { key: 'serialNumber', label: 'Serial Number', render: (row) => row.serialNumber || '-' },
    { key: 'quantity', label: 'Qty' },
    { key: 'unit', label: 'Unit' },
    { key: 'pcs', label: 'PCS' },
    { key: 'toOwnerName', label: 'Sent To' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'remarks', label: 'Remarks', render: (row) => row.remarks || '-' },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() =>
            setViewing({
              title: 'Material Transaction',
              details: Object.entries(row).map(([label, value]) => ({ label, value: String(value) })),
            })
          }
          className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
          aria-label="View transaction"
        >
          <Eye size={14} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Send Materials</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          Materials sent successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Select Technician</label>
            <select
              value={form.technicianId}
              onChange={(e) => setForm((prev) => ({ ...prev, technicianId: e.target.value }))}
              className={inputClasses}
            >
              <option value="">Select technician</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
            {formErrors.technicianId && <p className="mt-1 text-xs text-red-600">{formErrors.technicianId}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Select Material</label>
            <select value={form.catalogId} onChange={(e) => handleMaterialChange(e.target.value)} className={inputClasses}>
              <option value="">Select material</option>
              {catalog.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.materialName}
                </option>
              ))}
            </select>
            {formErrors.catalogId && <p className="mt-1 text-xs text-red-600">{formErrors.catalogId}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className={inputClasses}
            />
            {formErrors.quantity && <p className="mt-1 text-xs text-red-600">{formErrors.quantity}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Unit</label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
              placeholder="pcs, meters..."
              className={inputClasses}
            />
            {formErrors.unit && <p className="mt-1 text-xs text-red-600">{formErrors.unit}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">PCS</label>
            <input
              type="text"
              value={form.pcs}
              onChange={(e) => setForm((prev) => ({ ...prev, pcs: e.target.value }))}
              className={inputClasses}
            />
            {formErrors.pcs && <p className="mt-1 text-xs text-red-600">{formErrors.pcs}</p>}
          </div>
        </div>

        {selectedMaterial?.requiresScanner === 'Yes' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Serial Numbers</label>
            <SerialNumberInputs
              values={serialNumbers}
              onChange={handleSerialChange}
              error={formErrors.serialNumbers}
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
          <textarea
            value={form.remarks}
            onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
            className={inputClasses}
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 px-5 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Send size={18} />
          {submitting ? 'Sending...' : 'Send Materials'}
        </button>
      </form>

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by material, serial number, technician, or status"
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <select value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)} className={inputClasses}>
          <option value="All">All Technicians</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </select>
        <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)} className={inputClasses}>
          <option value="All">All Materials</option>
          {catalog.map((m) => (
            <option key={m.id} value={m.id}>
              {m.materialName}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClasses}>
          <option value="All">All Status</option>
          <option value="On Hand">On Hand</option>
          <option value="Used">Used</option>
          <option value="Transferred">Transferred</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
      ) : (
        <DataTable columns={historyColumns} rows={filteredHistory} />
      )}

      {viewing && (
        <RecordDetailsModal title={viewing.title} details={viewing.details} onClose={() => setViewing(null)} />
      )}
    </div>
  )
}
