import { useEffect, useMemo, useState } from 'react'
import { Send, ArrowRightLeft, Eye, AlertCircle, Search } from 'lucide-react'
import DataTable from '../../../components/Tables/DataTable'
import StatusBadge from '../../../components/Tables/StatusBadge'
import DispatchModal from '../../../components/Modals/DispatchModal'
import RecordDetailsModal from '../../../components/Modals/RecordDetailsModal'
import LoadingData from '../../../components/Loading/LoadingData'
import { apiRequest } from '../../../utils/sheetsApi'

const STATUS_OPTIONS = ['Pending', 'Dispatched', 'In Progress', 'Completed', 'Cancelled']
const STATUS_FILTER_OPTIONS = ['All', ...STATUS_OPTIONS]

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function DispatchInstall() {
  const [pendingSubscribers, setPendingSubscribers] = useState([])
  const [jobOrders, setJobOrders] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Pending')

  const [assigning, setAssigning] = useState(null)
  const [moving, setMoving] = useState(null)
  const [viewing, setViewing] = useState(null)

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [subsRes, jobsRes, techRes] = await Promise.all([
        apiRequest('getPendingSubscribers'),
        apiRequest('getJobOrders'),
        apiRequest('getTechnicians'),
      ])
      setPendingSubscribers(subsRes.subscribers || [])
      setJobOrders(jobsRes.jobOrders || [])
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

  const handleAssign = async (technicianId, technicianName, remarks) => {
    await apiRequest('createJobOrder', {
      subscriberId: assigning.id,
      projectId: assigning.projectId,
      assignedTechnicianId: technicianId,
      assignedTechnicianName: technicianName,
      remarks,
    })
    setAssigning(null)
    await loadAll()
  }

  const handleMove = async (technicianId, technicianName) => {
    await apiRequest('moveJobOrderTechnician', {
      jobOrderId: moving.id,
      assignedTechnicianId: technicianId,
      assignedTechnicianName: technicianName,
    })
    setMoving(null)
    await loadAll()
  }

  const installRecords = useMemo(() => {
    const unassigned = pendingSubscribers.map((s) => ({
      recordType: 'subscriber',
      id: s.id,
      subscriberName: s.subscriberName,
      address: s.address,
      projectId: s.projectId,
      encodedByTechnicianName: s.encodedByTechnicianName,
      status: s.status,
      createdAt: s.createdAt,
      assignedTechnicianName: '',
      raw: s,
    }))

    const assigned = jobOrders.map((j) => ({
      recordType: 'jobOrder',
      id: j.id,
      subscriberName: j.subscriberName,
      address: j.address,
      projectId: j.projectId,
      encodedByTechnicianName: j.encodedByTechnicianName,
      status: j.status,
      createdAt: j.createdAt,
      assignedTechnicianName: j.assignedTechnicianName,
      raw: j,
    }))

    return [...unassigned, ...assigned]
  }, [pendingSubscribers, jobOrders])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return installRecords.filter((r) => {
      const matchesSearch =
        !term ||
        r.subscriberName?.toLowerCase().includes(term) ||
        r.address?.toLowerCase().includes(term) ||
        r.projectId?.toLowerCase().includes(term) ||
        r.encodedByTechnicianName?.toLowerCase().includes(term) ||
        r.assignedTechnicianName?.toLowerCase().includes(term) ||
        r.status?.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [installRecords, search, statusFilter])

  const columns = [
    { key: 'subscriberName', label: 'Subscriber Name' },
    { key: 'address', label: 'Address' },
    { key: 'projectId', label: 'Project ID', render: (row) => row.projectId || '-' },
    { key: 'encodedByTechnicianName', label: 'Encoded By Technician' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'createdAt',
      label: 'Date Created',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'assignedTechnicianName',
      label: 'Assigned Technician',
      render: (row) => row.assignedTechnicianName || '—',
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <div className="flex gap-2">
          {row.recordType === 'subscriber' ? (
            <button
              type="button"
              onClick={() => setAssigning(row.raw)}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
            >
              <Send size={14} />
              Assign
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMoving(row.raw)}
              className="flex items-center gap-1 rounded-lg border border-orange-300 px-2.5 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
            >
              <ArrowRightLeft size={14} />
              Move
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              setViewing({
                title: row.recordType === 'subscriber' ? 'Subscriber Details' : 'Job Order Details',
                details: [
                  { label: 'ID', value: row.id },
                  { label: 'Subscriber Name', value: row.subscriberName },
                  { label: 'Address', value: row.address },
                  { label: 'Project ID', value: row.projectId },
                  { label: 'Encoded By', value: row.encodedByTechnicianName },
                  { label: 'Assigned Technician', value: row.assignedTechnicianName || '—' },
                  { label: 'Status', value: row.status },
                  { label: 'Date Created', value: new Date(row.createdAt).toLocaleString() },
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
      <h1 className="text-xl font-bold text-gray-800">Dispatch — Install</h1>

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
            placeholder="Search by subscriber, address, project ID, or technician"
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

      {assigning && (
        <DispatchModal
          mode="assign"
          title="Assign to Technician"
          details={[
            { label: 'Subscriber Name', value: assigning.subscriberName },
            { label: 'Address', value: assigning.address },
            { label: 'Project ID', value: assigning.projectId },
          ]}
          technicians={technicians}
          onConfirm={handleAssign}
          onClose={() => setAssigning(null)}
        />
      )}

      {moving && (
        <DispatchModal
          mode="move"
          title="Move Technician"
          details={[
            { label: 'Subscriber Name', value: moving.subscriberName },
            { label: 'Address', value: moving.address },
            { label: 'Project ID', value: moving.projectId },
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
