import { useState } from 'react'
import { Eye, AlertCircle } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import ViewTransactionModal from '../../components/Modals/ViewTransactionModal'
import LoadingData from '../../components/Loading/LoadingData'
import { useData } from '../../context/useData'
import { updateTransactionStatus } from '../../utils/sheetsApi'

const STATUS_OPTIONS = ['Pending', 'For Review', 'Completed', 'Rejected']

export default function Transactions() {
  const { transactions, loading, error, refresh } = useData()
  const [viewing, setViewing] = useState(null)
  const [statusError, setStatusError] = useState('')

  const sorted = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const handleStatusChange = async (id, status) => {
    setStatusError('')
    try {
      await updateTransactionStatus(id, status)
      await refresh()
      setViewing((prev) => (prev && prev.id === id ? { ...prev, status } : prev))
    } catch (err) {
      setStatusError(err.message)
    }
  }

  const columns = [
    { key: 'id', label: 'Transaction ID' },
    { key: 'technicianName', label: 'Technician' },
    { key: 'subscriber', label: 'Subscriber' },
    { key: 'focPrefabSerial', label: 'Serial Number' },
    {
      key: 'distance',
      label: 'Distance (m)',
      render: (row) => row.geotagging?.distanceMeters || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date Submitted',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewing(row)}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          <Eye size={14} />
          View
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Transactions</h1>

      {(statusError || error) && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {statusError || error}
        </div>
      )}

      {loading ? (
        <LoadingData />
      ) : (
        <DataTable columns={columns} rows={sorted} />
      )}

      {viewing && (
        <ViewTransactionModal
          transaction={viewing}
          onClose={() => setViewing(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
