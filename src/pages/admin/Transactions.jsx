import { useState } from 'react'
import { Eye } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import ViewTransactionModal from '../../components/Modals/ViewTransactionModal'
import { getTransactions, updateTransactionStatus } from '../../utils/storage'

const STATUS_OPTIONS = ['Pending', 'For Review', 'Completed', 'Rejected']

export default function Transactions() {
  const [transactions, setTransactions] = useState(() =>
    [...getTransactions()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  )
  const [viewing, setViewing] = useState(null)

  const handleStatusChange = (id, status) => {
    updateTransactionStatus(id, status)
    const refreshed = [...getTransactions()].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    setTransactions(refreshed)
    setViewing((prev) => (prev && prev.id === id ? refreshed.find((t) => t.id === id) : prev))
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

      <DataTable columns={columns} rows={transactions} />

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
