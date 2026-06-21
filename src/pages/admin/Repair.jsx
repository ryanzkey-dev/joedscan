import { useEffect, useMemo, useState } from 'react'
import { Plus, Send, ArrowRightLeft, Eye, AlertCircle, CheckCircle2 } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import PriorityBadge from '../../components/Tables/PriorityBadge'
import DispatchModal from '../../components/Modals/DispatchModal'
import RecordDetailsModal from '../../components/Modals/RecordDetailsModal'
import { apiRequest } from '../../utils/sheetsApi'

const ISSUE_TYPES = [
  'No Internet',
  'Slow Internet',
  'Modem Issue',
  'Cable Issue',
  'Signal Issue',
  'Relocation',
  'Others',
]

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
const STATUS_OPTIONS = ['Pending', 'Dispatched', 'In Progress', 'Completed', 'Cancelled']
const STATUS_FILTER_OPTIONS = ['All', ...STATUS_OPTIONS]
const PRIORITY_FILTER_OPTIONS = ['All', ...PRIORITIES]

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

const initialForm = {
  subscriberName: '',
  mobileNumber: '',
  address: '',
  issueType: ISSUE_TYPES[0],
  issueDescription: '',
  priority: 'Medium',
  remarks: '',
}

export default function Repair() {
  const [tickets, setTickets] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [technicianFilter, setTechnicianFilter] = useState('All')

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

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleAddTicket = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.subscriberName.trim()) next.subscriberName = 'Subscriber Name is required'
    if (!form.mobileNumber.trim()) next.mobileNumber = 'Mobile Number is required'
    if (!form.address.trim()) next.address = 'Address is required'
    if (!form.issueDescription.trim()) next.issueDescription = 'Issue Description is required'
    setFormErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    setError('')
    try {
      await apiRequest('addRepairTicket', form)
      await loadAll()
      setForm(initialForm)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

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

  const handleStatusChange = async (id, status) => {
    setError('')
    try {
      await apiRequest('updateRepairStatus', { repairTicketId: id, status })
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
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
        t.assignedTechnicianName?.toLowerCase().includes(term) ||
        t.id?.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter
      const matchesTechnician =
        technicianFilter === 'All' || t.assignedTechnicianId === technicianFilter
      return matchesSearch && matchesStatus && matchesPriority && matchesTechnician
    })
  }, [tickets, search, statusFilter, priorityFilter, technicianFilter])

  const columns = [
    { key: 'id', label: 'Repair ID' },
    { key: 'subscriberName', label: 'Subscriber Name' },
    { key: 'mobileNumber', label: 'Mobile Number' },
    { key: 'address', label: 'Address' },
    { key: 'issueType', label: 'Issue Type' },
    { key: 'priority', label: 'Priority', render: (row) => <PriorityBadge priority={row.priority} /> },
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
      key: 'assignedTechnicianName',
      label: 'Assigned Technician',
      render: (row) => row.assignedTechnicianName || '—',
    },
    {
      key: 'createdAt',
      label: 'Created At',
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
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Repair</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          Repair ticket created successfully
        </div>
      )}

      <form onSubmit={handleAddTicket} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Add Repair Ticket
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subscriber Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.subscriberName}
              onChange={handleFormChange('subscriberName')}
              className={inputClasses}
            />
            {formErrors.subscriberName && (
              <p className="mt-1 text-xs text-red-600">{formErrors.subscriberName}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={form.mobileNumber}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, mobileNumber: e.target.value.replace(/\D/g, '') }))
              }
              className={inputClasses}
            />
            {formErrors.mobileNumber && (
              <p className="mt-1 text-xs text-red-600">{formErrors.mobileNumber}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.address}
              onChange={handleFormChange('address')}
              className={inputClasses}
            />
            {formErrors.address && <p className="mt-1 text-xs text-red-600">{formErrors.address}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Issue Type</label>
            <select value={form.issueType} onChange={handleFormChange('issueType')} className={inputClasses}>
              {ISSUE_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
            <select value={form.priority} onChange={handleFormChange('priority')} className={inputClasses}>
              {PRIORITIES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Issue Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.issueDescription}
              onChange={handleFormChange('issueDescription')}
              className={inputClasses}
              rows={2}
            />
            {formErrors.issueDescription && (
              <p className="mt-1 text-xs text-red-600">{formErrors.issueDescription}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={handleFormChange('remarks')}
              className={inputClasses}
              rows={2}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 px-5 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Plus size={18} />
          {submitting ? 'Adding...' : 'Add Repair Ticket'}
        </button>
      </form>

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subscriber, mobile, address, issue, technician, or ID"
          className="w-full flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
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
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
        >
          {PRIORITY_FILTER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
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
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}

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
        <RecordDetailsModal
          title={viewing.title}
          details={viewing.details}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  )
}
