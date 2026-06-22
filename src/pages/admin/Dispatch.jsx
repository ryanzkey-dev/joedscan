import { useEffect, useState } from 'react'
import { Send, ArrowRightLeft, Eye, AlertCircle } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import StatusBadge from '../../components/Tables/StatusBadge'
import DispatchModal from '../../components/Modals/DispatchModal'
import RecordDetailsModal from '../../components/Modals/RecordDetailsModal'
import LoadingData from '../../components/Loading/LoadingData'
import { apiRequest } from '../../utils/sheetsApi'

export default function Dispatch() {
  const [pendingSubscribers, setPendingSubscribers] = useState([])
  const [jobOrders, setJobOrders] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  const subscriberColumns = [
    { key: 'subscriberName', label: 'Subscriber Name' },
    { key: 'address', label: 'Address' },
    { key: 'projectId', label: 'Project ID', render: (row) => row.projectId || '-' },
    { key: 'encodedByTechnicianName', label: 'Encoded By Technician' },
    {
      key: 'status',
      label: 'Current Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Date Created',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    { key: 'assignedTechnician', label: 'Assigned Technician', render: () => '—' },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAssigning(row)}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
          >
            <Send size={14} />
            Assign
          </button>
          <button
            type="button"
            onClick={() =>
              setViewing({
                title: 'Subscriber Details',
                details: [
                  { label: 'Subscriber ID', value: row.id },
                  { label: 'Subscriber Name', value: row.subscriberName },
                  { label: 'Address', value: row.address },
                  { label: 'Project ID', value: row.projectId },
                  { label: 'Serial Number', value: row.serialNumber },
                  { label: 'Encoded By', value: row.encodedByTechnicianName },
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

  const jobOrderColumns = [
    { key: 'subscriberName', label: 'Subscriber Name' },
    { key: 'address', label: 'Address' },
    { key: 'projectId', label: 'Project ID', render: (row) => row.projectId || '-' },
    { key: 'assignedTechnicianName', label: 'Assigned Technician' },
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMoving(row)}
            className="flex items-center gap-1 rounded-lg border border-orange-300 px-2.5 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
          >
            <ArrowRightLeft size={14} />
            Move
          </button>
          <button
            type="button"
            onClick={() =>
              setViewing({
                title: 'Job Order Details',
                details: [
                  { label: 'Job Order ID', value: row.id },
                  { label: 'Subscriber Name', value: row.subscriberName },
                  { label: 'Address', value: row.address },
                  { label: 'Project ID', value: row.projectId },
                  { label: 'Encoded By', value: row.encodedByTechnicianName },
                  { label: 'Assigned Technician', value: row.assignedTechnicianName },
                  { label: 'Status', value: row.status },
                  { label: 'Remarks', value: row.remarks },
                  { label: 'Dispatch Date', value: new Date(row.dispatchDate).toLocaleString() },
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
      <h1 className="text-xl font-bold text-gray-800">Dispatch</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">Pending Subscribers</p>
        {loading ? (
          <LoadingData />
        ) : (
          <DataTable columns={subscriberColumns} rows={pendingSubscribers} />
        )}
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">Job Orders</p>
        {loading ? (
          <LoadingData />
        ) : (
          <DataTable columns={jobOrderColumns} rows={jobOrders} />
        )}
      </div>

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
        <RecordDetailsModal
          title={viewing.title}
          details={viewing.details}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  )
}
