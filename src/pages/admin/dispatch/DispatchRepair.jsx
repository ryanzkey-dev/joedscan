import { useEffect, useMemo, useState } from 'react'
import { Send, ArrowRightLeft, Eye, AlertCircle, Search } from 'lucide-react'
import DataTable from '../../../components/Tables/DataTable'
import StatusBadge from '../../../components/Tables/StatusBadge'
import PriorityBadge from '../../../components/Tables/PriorityBadge'
import DispatchModal from '../../../components/Modals/DispatchModal'
import RecordDetailsModal from '../../../components/Modals/RecordDetailsModal'
import LoadingData from '../../../components/Loading/LoadingData'
import { apiRequest } from '../../../utils/sheetsApi'

const STATUS_OPTIONS = ['Pending', 'Dispatched', 'In Progress', 'Completed', 'Cancelled']
const STATUS_FILTER_OPTIONS = ['All', ...STATUS_OPTIONS]

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function DispatchRepair() {
  const [tickets, setTickets] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Pending')

  const [dispatching, setDispatching] = useState(null)
  const [moving, setMoving] = useState(null)
  const [viewing, setViewing] = useState(null)

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [ticketsRes, techRes] = await Promise.all([
        apiRequest('getRepairTickets'),
        apiRequest('getTechnicians'),
      ])
      setTickets(ticketsRes.repairTickets || [])
      setTechnicians(techRes.technicians || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadAll()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleDispatch = async (technicianId, technicianName) => {
    await apiRequest('dispatchRepairTicket', {
      repairTicketId: dispatching.id,
      assignedTechnicianId: technicianId,
      assignedTechnicianName: technicianName,
    })
    setDispatching(null)
    await loadAll()
  }

  const handleMove = async (technicianId, technicianName) => {
    await apiRequest('moveRepairTicketTechnician', {
      repairTicketId: moving.id,
      assignedTechnicianId: technicianId,
      assignedTechnicianName: technicianName,
    })
    setMoving(null)
    await loadAll()
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return tickets.filter((t) => {
      const matchesSearch =
        !term ||
        t.subscriberName?.toLowerCase().includes(term) ||
        t.mobileNumber?.toLowerCase().includes(term) ||
        t.address?.toLowerCase().includes(term) ||
        t.issueType?.toLowerCase().includes(term) ||
        t.priority?.toLowerCase().includes(term) ||
        t.assignedTechnicianName?.toLowerCase().includes(term) ||
        t.status?.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [tickets, search, statusFilter])

  const columns = [
    { key: 'subscriberName', label: 'Subscriber Name' },
    { key: 'mobileNumber', label: 'Mobile Number' },
    { key: 'address', label: 'Address' },
    { key: 'issueType', label: 'Issue Type' },
    { key: 'priority', label: 'Priority', render: (row) => <PriorityBadge priority={row.priority} /> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'assignedTechnicianName',
      label: 'Assigned Technician',
      render: (row) => row.assignedTechnicianName || '—',
    },
    {
      key: 'createdAt',
      label: 'Date Created',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <div className="flex gap-2">
          {row.assignedTechnicianId ? (
            <button
              type="button"
              onClick={() => setMoving(row)}
              className="flex items-center gap-1 rounded-lg border border-orange-300 px-2.5 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
            >
              <ArrowRightLeft size={14} />
              Move
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDispatching(row)}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
            >
              <Send size={14} />
              Dispatch
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              setViewing({
                title: 'Repair Ticket Details',
                details: [
                  { label: 'Repair ID', value: row.id },
                  { label: 'Subscriber Name', value: row.subscriberName },
                  { label: 'Mobile Number', value: row.mobileNumber },
                  { label: 'Address', value: row.address },
                  { label: 'Issue Type', value: row.issueType },
                  { label: 'Issue Description', value: row.issueDescription },
                  { label: 'Priority', value: row.priority },
                  { label: 'Remarks', value: row.remarks },
                  { label: 'Status', value: row.status },
                  { label: 'Assigned Technician', value: row.assignedTechnicianName },
                  {
                    label: 'Dispatch Date',
                    value: row.dispatchDate ? new Date(row.dispatchDate).toLocaleString() : '',
                  },
                  { label: 'Created At', value: new Date(row.createdAt).toLocaleString() },
                ],
              })
            }
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <Eye size={14} />
            View
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      <h1 className="text-xl font-bold text-gray-800">Dispatch — Repair</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative lg:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subscriber, mobile, address, issue, priority, or technician"
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClasses}>
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {loading ? <LoadingData /> : <DataTable columns={columns} rows={filtered} />}

      {dispatching && (
        <DispatchModal
          mode="assign"
          title="Dispatch Repair Ticket"
          details={[
            { label: 'Subscriber Name', value: dispatching.subscriberName },
            { label: 'Issue Type', value: dispatching.issueType },
            { label: 'Priority', value: dispatching.priority },
          ]}
          technicians={technicians}
          onConfirm={handleDispatch}
          onClose={() => setDispatching(null)}
        />
      )}

      {moving && (
        <DispatchModal
          mode="move"
          title="Move Technician"
          details={[
            { label: 'Subscriber Name', value: moving.subscriberName },
            { label: 'Issue Type', value: moving.issueType },
            { label: 'Priority', value: moving.priority },
          ]}
          currentTechnicianName={moving.assignedTechnicianName}
          technicians={technicians}
          onConfirm={handleMove}
          onClose={() => setMoving(null)}
        />
      )}

      {viewing && (
        <RecordDetailsModal title={viewing.title} details={viewing.details} onClose={() => setViewing(null)} />
      )}
    </div>
  )
}
