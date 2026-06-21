import { useMemo, useState } from 'react'
import { Search, Eye, AlertCircle } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import StatusBadge from '../../components/Tables/StatusBadge'
import ViewTransactionModal from '../../components/Modals/ViewTransactionModal'
import { useData } from '../../context/useData'

const STATUS_OPTIONS = ['All', 'Pending', 'For Review', 'Completed', 'Rejected']

export default function Subscribers() {
  const { technicians, transactions, loading, error } = useData()

  const [search, setSearch] = useState('')
  const [technicianFilter, setTechnicianFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewing, setViewing] = useState(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return transactions.filter((t) => {
      const matchesSearch =
        !term ||
        t.subscriber?.toLowerCase().includes(term) ||
        t.focPrefabSerial?.toLowerCase().includes(term) ||
        t.modem?.toLowerCase().includes(term) ||
        t.technicianName?.toLowerCase().includes(term)
      const matchesTechnician = technicianFilter === 'All' || t.technicianId === technicianFilter
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter
      return matchesSearch && matchesTechnician && matchesStatus
    })
  }, [transactions, search, technicianFilter, statusFilter])

  const columns = [
    { key: 'id', label: 'Subscriber ID' },
    { key: 'subscriber', label: 'Subscriber' },
    { key: 'address', label: 'Address' },
    { key: 'technicianName', label: 'Technician' },
    { key: 'focPrefabSerial', label: 'Serial Number' },
    { key: 'distanceMeters', label: 'Distance (m)' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
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
      <h1 className="text-xl font-bold text-gray-800">Subscribers</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subscriber, serial, or technician"
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <select
          value={technicianFilter}
          onChange={(e) => setTechnicianFilter(e.target.value)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="All">All Technicians</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}

      {viewing && <ViewTransactionModal transaction={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}
