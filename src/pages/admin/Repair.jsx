import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Send,
  ArrowRightLeft,
  Eye,
  AlertCircle,
  CheckCircle2,
  Trash2,
  XCircle,
  PlusCircle,
} from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import PriorityBadge from '../../components/Tables/PriorityBadge'
import DispatchModal from '../../components/Modals/DispatchModal'
import RecordDetailsModal from '../../components/Modals/RecordDetailsModal'
import { useAuth } from '../../context/useAuth'
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

const TABS = ['Bulk Repair Upload', 'Single Repair Ticket', 'Repair Tickets List']

const BULK_COLUMN_KEYS = [
  'subscriberName',
  'mobileNumber',
  'address',
  'issueType',
  'issueDescription',
  'priority',
  'remarks',
  'status',
]

const DEFAULT_BULK_ROW_COUNT = 10

function createEmptyRepairRow() {
  return {
    subscriberName: '',
    mobileNumber: '',
    address: '',
    issueType: '',
    issueDescription: '',
    priority: 'Medium',
    remarks: '',
    status: 'Pending',
  }
}

function isRowEmpty(row) {
  return BULK_COLUMN_KEYS.every((key) => !String(row[key] || '').trim())
}

function isRowValid(row) {
  return (
    row.subscriberName.trim() &&
    row.mobileNumber.trim() &&
    row.address.trim() &&
    row.issueType.trim() &&
    row.issueDescription.trim() &&
    row.priority.trim() &&
    row.status.trim()
  )
}

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

const cellInputClasses =
  'w-full min-w-[160px] rounded border-0 bg-transparent px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400'

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
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(TABS[0])

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

  const [bulkRows, setBulkRows] = useState(() =>
    Array.from({ length: DEFAULT_BULK_ROW_COUNT }, createEmptyRepairRow)
  )
  const [bulkRowErrors, setBulkRowErrors] = useState({})
  const [bulkError, setBulkError] = useState('')
  const [bulkSuccess, setBulkSuccess] = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)

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

  // ---- Bulk Repair Upload ----

  const updateBulkCell = (rowIndex, key, value) => {
    setBulkRows((prev) => {
      const updated = [...prev]
      updated[rowIndex] = { ...updated[rowIndex], [key]: value }
      return updated
    })
    setBulkRowErrors((prev) => {
      if (!prev[rowIndex]) return prev
      const next = { ...prev }
      delete next[rowIndex]
      return next
    })
  }

  const handleBulkPaste = (e, startRowIndex, startColumnKey) => {
    e.preventDefault()

    const pastedText = e.clipboardData.getData('text')
    const rows = pastedText
      .replace(/\r/g, '')
      .split('\n')
      .filter((row, idx, arr) => !(idx === arr.length - 1 && row === ''))
      .map((row) => row.split('\t'))

    const startColumnIndex = BULK_COLUMN_KEYS.indexOf(startColumnKey)
    if (startColumnIndex === -1) return

    setBulkRows((prevRows) => {
      const updatedRows = [...prevRows]

      rows.forEach((rowData, rowOffset) => {
        const targetRowIndex = startRowIndex + rowOffset

        while (updatedRows.length <= targetRowIndex) {
          updatedRows.push(createEmptyRepairRow())
        }

        rowData.forEach((cellValue, colOffset) => {
          const targetColumnKey = BULK_COLUMN_KEYS[startColumnIndex + colOffset]
          if (targetColumnKey) {
            updatedRows[targetRowIndex] = {
              ...updatedRows[targetRowIndex],
              [targetColumnKey]: cellValue.trim(),
            }
          }
        })
      })

      return updatedRows
    })

    setBulkRowErrors({})
  }

  const handleAddRow = () => setBulkRows((prev) => [...prev, createEmptyRepairRow()])

  const handleAddTenRows = () =>
    setBulkRows((prev) => [...prev, ...Array.from({ length: 10 }, createEmptyRepairRow)])

  const handleClearTable = () => {
    setBulkRows(Array.from({ length: DEFAULT_BULK_ROW_COUNT }, createEmptyRepairRow))
    setBulkRowErrors({})
    setBulkError('')
    setBulkSuccess('')
  }

  const handleClearRow = (rowIndex) => {
    setBulkRows((prev) => {
      const updated = [...prev]
      updated[rowIndex] = createEmptyRepairRow()
      return updated
    })
    setBulkRowErrors((prev) => {
      if (!prev[rowIndex]) return prev
      const next = { ...prev }
      delete next[rowIndex]
      return next
    })
  }

  const handleDeleteRow = (rowIndex) => {
    setBulkRows((prev) => prev.filter((_, idx) => idx !== rowIndex))
    setBulkRowErrors({})
  }

  const handleBulkSubmit = async () => {
    setBulkError('')
    setBulkSuccess('')

    const rowErrors = {}
    const validTickets = []

    bulkRows.forEach((row, idx) => {
      if (isRowEmpty(row)) return
      if (!isRowValid(row)) {
        rowErrors[idx] = true
        return
      }
      validTickets.push({
        subscriberName: row.subscriberName.trim(),
        mobileNumber: row.mobileNumber.trim(),
        address: row.address.trim(),
        issueType: row.issueType.trim(),
        issueDescription: row.issueDescription.trim(),
        priority: row.priority.trim(),
        remarks: row.remarks.trim(),
        status: row.status.trim(),
      })
    })

    if (Object.keys(rowErrors).length > 0) {
      setBulkRowErrors(rowErrors)
      setBulkError('Some rows are missing required fields. Highlighted rows need attention.')
      return
    }

    if (validTickets.length === 0) {
      setBulkError('Add at least one complete row before submitting.')
      return
    }

    setBulkSubmitting(true)
    try {
      const res = await apiRequest('bulkAddRepairTickets', {
        tickets: validTickets,
        userId: user.id,
        userName: user.fullName,
      })
      setBulkSuccess(
        `${res.addedCount} repair ticket(s) added successfully.` +
          (res.failedCount ? ` ${res.failedCount} row(s) failed.` : '')
      )
      setBulkRows(Array.from({ length: DEFAULT_BULK_ROW_COUNT }, createEmptyRepairRow))
      setBulkRowErrors({})
      await loadAll()
    } catch (err) {
      setBulkError(err.message)
    } finally {
      setBulkSubmitting(false)
    }
  }

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
    <div className="w-full max-w-full space-y-6 overflow-hidden">
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

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
              activeTab === tab
                ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-orange-50'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'Bulk Repair Upload' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-800">
            Tip: You can copy data from Excel or Google Sheets and paste it directly into this
            table. The system will auto-fill rows and columns.
          </div>

          {bulkError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle size={18} />
              {bulkError}
            </div>
          )}

          {bulkSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <CheckCircle2 size={18} />
              {bulkSuccess}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus size={14} />+ Add Row
            </button>
            <button
              type="button"
              onClick={handleAddTenRows}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <PlusCircle size={14} />+ Add 10 Rows
            </button>
            <button
              type="button"
              onClick={handleClearTable}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Trash2 size={14} />
              Clear Table
            </button>
            <button
              type="button"
              onClick={handleBulkSubmit}
              disabled={bulkSubmitting}
              className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send size={16} />
              {bulkSubmitting ? 'Submitting...' : 'Submit All Repair Tickets'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="max-h-[600px] w-full overflow-auto">
              <table className="min-w-[1400px] w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="whitespace-nowrap px-2 py-3 font-semibold">#</th>
                    <th className="min-w-[180px] whitespace-nowrap px-2 py-3 font-semibold">
                      Subscriber Name
                    </th>
                    <th className="min-w-[160px] whitespace-nowrap px-2 py-3 font-semibold">
                      Mobile Number
                    </th>
                    <th className="min-w-[200px] whitespace-nowrap px-2 py-3 font-semibold">
                      Address
                    </th>
                    <th className="min-w-[160px] whitespace-nowrap px-2 py-3 font-semibold">
                      Issue Type
                    </th>
                    <th className="min-w-[220px] whitespace-nowrap px-2 py-3 font-semibold">
                      Issue Description
                    </th>
                    <th className="min-w-[140px] whitespace-nowrap px-2 py-3 font-semibold">
                      Priority
                    </th>
                    <th className="min-w-[180px] whitespace-nowrap px-2 py-3 font-semibold">
                      Remarks
                    </th>
                    <th className="min-w-[160px] whitespace-nowrap px-2 py-3 font-semibold">
                      Status
                    </th>
                    <th className="min-w-[120px] whitespace-nowrap px-2 py-3 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bulkRows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={bulkRowErrors[rowIndex] ? 'bg-red-50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-2 py-1 text-center text-xs text-gray-400">{rowIndex + 1}</td>
                      <td className="px-1 py-1">
                        <input
                          value={row.subscriberName}
                          onChange={(e) => updateBulkCell(rowIndex, 'subscriberName', e.target.value)}
                          onPaste={(e) => handleBulkPaste(e, rowIndex, 'subscriberName')}
                          className={cellInputClasses}
                        />
                      </td>
                      <td className="px-1 py-1">
                        <input
                          value={row.mobileNumber}
                          onChange={(e) => updateBulkCell(rowIndex, 'mobileNumber', e.target.value)}
                          onPaste={(e) => handleBulkPaste(e, rowIndex, 'mobileNumber')}
                          className={cellInputClasses}
                        />
                      </td>
                      <td className="px-1 py-1">
                        <input
                          value={row.address}
                          onChange={(e) => updateBulkCell(rowIndex, 'address', e.target.value)}
                          onPaste={(e) => handleBulkPaste(e, rowIndex, 'address')}
                          className={cellInputClasses}
                        />
                      </td>
                      <td className="px-1 py-1">
                        <select
                          value={row.issueType}
                          onChange={(e) => updateBulkCell(rowIndex, 'issueType', e.target.value)}
                          onPaste={(e) => handleBulkPaste(e, rowIndex, 'issueType')}
                          className={cellInputClasses}
                        >
                          <option value="">Select</option>
                          {ISSUE_TYPES.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-1 py-1">
                        <input
                          value={row.issueDescription}
                          onChange={(e) => updateBulkCell(rowIndex, 'issueDescription', e.target.value)}
                          onPaste={(e) => handleBulkPaste(e, rowIndex, 'issueDescription')}
                          className={cellInputClasses}
                        />
                      </td>
                      <td className="px-1 py-1">
                        <select
                          value={row.priority}
                          onChange={(e) => updateBulkCell(rowIndex, 'priority', e.target.value)}
                          onPaste={(e) => handleBulkPaste(e, rowIndex, 'priority')}
                          className={cellInputClasses}
                        >
                          {PRIORITIES.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-1 py-1">
                        <input
                          value={row.remarks}
                          onChange={(e) => updateBulkCell(rowIndex, 'remarks', e.target.value)}
                          onPaste={(e) => handleBulkPaste(e, rowIndex, 'remarks')}
                          className={cellInputClasses}
                        />
                      </td>
                      <td className="px-1 py-1">
                        <select
                          value={row.status}
                          onChange={(e) => updateBulkCell(rowIndex, 'status', e.target.value)}
                          onPaste={(e) => handleBulkPaste(e, rowIndex, 'status')}
                          className={cellInputClasses}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-1 py-1">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleClearRow(rowIndex)}
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                            aria-label="Clear row"
                            title="Clear Row"
                          >
                            <XCircle size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(rowIndex)}
                            className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                            aria-label="Delete row"
                            title="Delete Row"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Single Repair Ticket' && (
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
      )}

      {activeTab === 'Repair Tickets List' && (
        <div className="space-y-4">
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
        </div>
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
