import { useMemo, useState } from 'react'
import { Search, Eye, Pencil, AlertCircle, CheckCircle2 } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import StatusBadge from '../../components/Tables/StatusBadge'
import ViewTransactionModal from '../../components/Modals/ViewTransactionModal'
import EditRawDataModal from '../../components/Modals/EditRawDataModal'
import { useData } from '../../context/useData'
import { updateRawData } from '../../utils/sheetsApi'

const STATUS_FILTER_OPTIONS = [
  'All',
  'Pending',
  'Dispatched',
  'In Progress',
  'Completed',
  'Rejected',
  'Cancelled',
]

export default function RawData() {
  const { transactions, loading, error, refresh } = useData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return transactions.filter((t) => {
      const matchesSearch =
        !term ||
        t.subscriber?.toLowerCase().includes(term) ||
        t.address?.toLowerCase().includes(term) ||
        t.projectId?.toLowerCase().includes(term) ||
        t.modem?.toLowerCase().includes(term) ||
        t.telset?.toLowerCase().includes(term) ||
        t.iptvCcaNo?.toLowerCase().includes(term) ||
        t.status?.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [transactions, search, statusFilter])

  const handleSaveEdit = async (updates) => {
    await updateRawData(editing.id, updates)
    await refresh()
    setEditing(null)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const cell = (value) => <span className="uppercase">{value || '-'}</span>

  const columns = [
    { key: 'date', label: 'DATE', render: (row) => cell(row.date) },
    { key: 'subscriber', label: 'SUBSCRIBER', render: (row) => cell(row.subscriber) },
    { key: 'address', label: 'ADDRESS', render: (row) => cell(row.address) },
    { key: 'projectId', label: 'PROJECT ID', render: (row) => cell(row.projectId) },
    { key: 'focPrefabSerial', label: 'FOC PREFAB', render: (row) => cell(row.focPrefabSerial) },
    { key: 'modem', label: 'MODEM', render: (row) => cell(row.modem) },
    { key: 'telset', label: 'TELSET', render: (row) => cell(row.telset) },
    { key: 'iptvCcaNo', label: 'IPTV CCA NO.', render: (row) => cell(row.iptvCcaNo) },
    {
      key: 'geotagging',
      label: 'GEOTAGGING',
      render: (row) => cell(row.geotagging?.distanceMeters ? `${row.geotagging.distanceMeters} m` : ''),
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (row) => <StatusBadge status={row.status} className="uppercase" />,
    },
    {
      key: 'action',
      label: 'ACTION',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewing(row)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
            aria-label="View details"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={() => setEditing(row)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
            aria-label="Edit record"
          >
            <Pencil size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Raw Data</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          Record updated successfully
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subscriber, address, project ID, modem, telset, IPTV CCA No., or status"
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </div>

      {viewing && <ViewTransactionModal transaction={viewing} onClose={() => setViewing(null)} />}

      {editing && (
        <EditRawDataModal
          record={editing}
          onSave={handleSaveEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
