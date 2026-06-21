import { useMemo, useState } from 'react'
import { Search, Eye } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import StatusBadge from '../../components/Tables/StatusBadge'
import ViewTransactionModal from '../../components/Modals/ViewTransactionModal'
import { useAuth } from '../../context/useAuth'
import { getTransactions } from '../../utils/storage'

export default function MyEncodedRecords() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)

  const myTransactions = getTransactions().filter((t) => t.technicianId === user.id)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return myTransactions
    return myTransactions.filter(
      (t) =>
        t.subscriber?.toLowerCase().includes(term) ||
        t.focPrefabSerial?.toLowerCase().includes(term) ||
        t.modem?.toLowerCase().includes(term)
    )
  }, [myTransactions, search])

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const columns = [
    { key: 'id', label: 'Transaction ID' },
    { key: 'subscriber', label: 'Subscriber Name' },
    { key: 'focPrefabSerial', label: 'Serial Number' },
    {
      key: 'distance',
      label: 'Distance (m)',
      render: (row) => row.geotagging?.distanceMeters || '—',
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'createdAt',
      label: 'Date Submitted',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'action',
      label: 'View Details',
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
      <h1 className="text-xl font-bold text-gray-800">My Encoded Records</h1>

      <div className="relative rounded-xl bg-white p-4 shadow-sm">
        <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subscriber, serial, or modem number"
          className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <DataTable columns={columns} rows={sorted} />

      {viewing && <ViewTransactionModal transaction={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}
