import { useMemo, useState } from 'react'
import { Search, Eye, Pencil, AlertCircle, CheckCircle2 } from 'lucide-react'
import Pagination from '../../components/Tables/Pagination'
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

const PAGE_SIZE = 10

function formatDisplayDate(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

export default function RawData() {
  const { transactions, loading, error, refresh } = useData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageStart = (page - 1) * PAGE_SIZE
  const visibleRows = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const handleSaveEdit = async (updates) => {
    await updateRawData(editing.id, updates)
    await refresh()
    setEditing(null)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="w-full max-w-full space-y-4 overflow-hidden">
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
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by subscriber, address, project ID, modem, telset, IPTV CCA No., or status"
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1400px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">DATE</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">SUBSCRIBER</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">ADDRESS</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">PROJECT ID</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">FOC PREFAB</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">MODEM</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">TELSET</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">IPTV CCA NO.</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">GEOTAGGING</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">STATUS</th>
                  <th className="sticky right-0 z-10 whitespace-nowrap bg-gray-50 px-4 py-3 font-semibold">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-400">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.id} className="group hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {formatDisplayDate(row.date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 uppercase text-gray-700">
                        {row.subscriber || '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 uppercase text-gray-700">
                        {row.address || '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 uppercase text-gray-700">
                        {row.projectId || '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 uppercase text-gray-700">
                        {row.focPrefabSerial || '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 uppercase text-gray-700">
                        {row.modem || '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 uppercase text-gray-700">
                        {row.telset || '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 uppercase text-gray-700">
                        {row.iptvCcaNo || '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 uppercase text-gray-700">
                        {row.geotagging?.distanceMeters ? `${row.geotagging.distanceMeters} m` : '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge status={row.status} className="uppercase" />
                      </td>
                      <td className="sticky right-0 z-10 whitespace-nowrap bg-white px-4 py-3 group-hover:bg-gray-50">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {viewing && <ViewTransactionModal transaction={viewing} onClose={() => setViewing(null)} />}

      {editing && (
        <EditRawDataModal record={editing} onSave={handleSaveEdit} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
