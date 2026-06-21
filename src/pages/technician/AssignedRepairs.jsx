import { useEffect, useState } from 'react'
import { Eye, PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import StatusBadge from '../../components/Tables/StatusBadge'
import PriorityBadge from '../../components/Tables/PriorityBadge'
import RecordDetailsModal from '../../components/Modals/RecordDetailsModal'
import { useAuth } from '../../context/useAuth'
import { apiRequest } from '../../utils/sheetsApi'

export default function AssignedRepairs() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewing, setViewing] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiRequest('getTechnicianRepairTickets', { technicianId: user.id })
      setTickets(res.repairTickets || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    load()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleStatusChange = async (id, status) => {
    setError('')
    try {
      await apiRequest('updateRepairStatus', { repairTicketId: id, status })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const columns = [
    { key: 'id', label: 'Repair ID' },
    { key: 'subscriberName', label: 'Subscriber Name' },
    { key: 'mobileNumber', label: 'Mobile Number' },
    { key: 'address', label: 'Address' },
    { key: 'issueType', label: 'Issue Type' },
    { key: 'issueDescription', label: 'Issue Description' },
    { key: 'priority', label: 'Priority', render: (row) => <PriorityBadge priority={row.priority} /> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'dispatchDate',
      label: 'Dispatch Date',
      render: (row) => (row.dispatchDate ? new Date(row.dispatchDate).toLocaleDateString() : '—'),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.status === 'Dispatched' && (
            <button
              type="button"
              onClick={() => handleStatusChange(row.id, 'In Progress')}
              className="flex items-center gap-1 rounded-lg border border-orange-300 px-2.5 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
            >
              <PlayCircle size={14} />
              Start Repair
            </button>
          )}
          {row.status !== 'Completed' && (
            <button
              type="button"
              onClick={() => handleStatusChange(row.id, 'Completed')}
              className="flex items-center gap-1 rounded-lg border border-green-300 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 size={14} />
              Mark Completed
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
                  {
                    label: 'Dispatch Date',
                    value: row.dispatchDate ? new Date(row.dispatchDate).toLocaleString() : '',
                  },
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
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Assigned Repairs</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
      ) : (
        <DataTable columns={columns} rows={tickets} />
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
