import { useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import DataTable from '../../../components/Tables/DataTable'
import LoadingData from '../../../components/Loading/LoadingData'
import { useAuth } from '../../../context/useAuth'
import { apiRequest } from '../../../utils/sheetsApi'

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function TechnicianTransferMaterials() {
  const { user } = useAuth()
  const [myStocks, setMyStocks] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [materialStockId, setMaterialStockId] = useState('')
  const [toTechnicianId, setToTechnicianId] = useState('')
  const [toTechnicianName, setToTechnicianName] = useState('')
  const [remarks, setRemarks] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [stocksRes, techRes, historyRes] = await Promise.all([
        apiRequest('getTechnicianMaterialStocks', { technicianId: user.id }),
        apiRequest('getTechnicians'),
        apiRequest('getMaterialTransactions', { transactionType: 'TECHNICIAN_TRANSFER' }),
      ])
      setMyStocks((stocksRes.materialStocks || []).filter((s) => s.status === 'On Hand'))
      setTechnicians((techRes.technicians || []).filter((t) => String(t.id) !== String(user.id)))
      setHistory((historyRes.materialTransactions || []).filter((h) => h.fromOwnerId === user.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    load()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleToTechnicianChange = (e) => {
    const selectedId = e.target.value
    const selectedTech = technicians.find((t) => String(t.id) === String(selectedId))

    setToTechnicianId(selectedId)
    setToTechnicianName(selectedTech?.fullName || selectedTech?.name || '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!materialStockId) next.materialStockId = 'Select a material'
    if (!toTechnicianId) next.toTechnicianId = 'Select recipient technician'
    setFormErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    setError('')
    try {
      await apiRequest('transferMaterialTechnician', {
        materialStockId,
        fromTechnicianId: user.id,
        fromTechnicianName: user.fullName,
        toTechnicianId,
        toTechnicianName,
        remarks: remarks.trim(),
        userId: user.id,
        userName: user.fullName,
      })
      await load()
      setMaterialStockId('')
      setToTechnicianId('')
      setToTechnicianName('')
      setRemarks('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const historyColumns = useMemo(
    () => [
      { key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
      { key: 'materialName', label: 'Material Name' },
      { key: 'serialNumber', label: 'Serial Number', render: (row) => row.serialNumber || '-' },
      { key: 'fromOwnerName', label: 'From Technician' },
      { key: 'toOwnerName', label: 'To Technician' },
      { key: 'status', label: 'Status' },
      { key: 'remarks', label: 'Remarks', render: (row) => row.remarks || '-' },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Transfer Materials</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          Material transferred successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Select Material</label>
            <select value={materialStockId} onChange={(e) => setMaterialStockId(e.target.value)} className={inputClasses}>
              <option value="">Select material</option>
              {myStocks.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.materialName} {s.serialNumber ? `(${s.serialNumber})` : `x${s.quantity}`}
                </option>
              ))}
            </select>
            {formErrors.materialStockId && (
              <p className="mt-1 text-xs text-red-600">{formErrors.materialStockId}</p>
            )}
            {myStocks.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">You have no On Hand materials to transfer.</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Recipient Technician</label>
            <select value={toTechnicianId} onChange={handleToTechnicianChange} className={inputClasses}>
              <option value="">Select Technician Recipient</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName || t.name}
                </option>
              ))}
            </select>
            {formErrors.toTechnicianId && <p className="mt-1 text-xs text-red-600">{formErrors.toTechnicianId}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputClasses} rows={2} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 px-5 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <ArrowRightLeft size={18} />
          {submitting ? 'Transferring...' : 'Submit Transfer'}
        </button>
      </form>

      {loading ? (
        <LoadingData />
      ) : (
        <DataTable columns={historyColumns} rows={history} />
      )}
    </div>
  )
}
