import { useEffect, useMemo, useState } from 'react'
import { Eye, AlertCircle } from 'lucide-react'
import DataTable from '../../../components/Tables/DataTable'
import LoadingData from '../../../components/Loading/LoadingData'
import TechnicianDashboardModal from '../../../components/Modals/TechnicianDashboardModal'
import { apiRequest } from '../../../utils/sheetsApi'

const PENDING_STATUSES = ['Pending', 'Dispatched', 'In Progress']

export default function ViewAllTechnician() {
  const [technicians, setTechnicians] = useState([])
  const [jobOrders, setJobOrders] = useState([])
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewingTechnician, setViewingTechnician] = useState(null)

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [techRes, jobOrdersRes, repairsRes] = await Promise.all([
        apiRequest('getTechnicians'),
        apiRequest('getJobOrders'),
        apiRequest('getRepairTickets'),
      ])
      setTechnicians(techRes.technicians || [])
      setJobOrders(jobOrdersRes.jobOrders || [])
      setRepairs(repairsRes.repairTickets || [])
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

  const rows = useMemo(() => {
    return technicians.map((t) => {
      const techJobOrders = jobOrders.filter((j) => String(j.assignedTechnicianId) === String(t.id))
      const techRepairs = repairs.filter((r) => String(r.assignedTechnicianId) === String(t.id))

      const totalJobOrder = techJobOrders.length + techRepairs.length
      const pending =
        techJobOrders.filter((j) => PENDING_STATUSES.includes(j.status)).length +
        techRepairs.filter((r) => PENDING_STATUSES.includes(r.status)).length
      const completed =
        techJobOrders.filter((j) => j.status === 'Completed').length +
        techRepairs.filter((r) => r.status === 'Completed').length

      return { ...t, totalJobOrder, pending, completed }
    })
  }, [technicians, jobOrders, repairs])

  const columns = [
    { key: 'fullName', label: 'Technician Name' },
    { key: 'address', label: 'Address' },
    { key: 'username', label: 'Username' },
    { key: 'totalJobOrder', label: 'Total Job Order' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewingTechnician(row)}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          <Eye size={14} />
          View Dashboard
        </button>
      ),
    },
  ]

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      <h1 className="text-xl font-bold text-gray-800">View All Technician</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? <LoadingData /> : <DataTable columns={columns} rows={rows} />}

      {viewingTechnician && (
        <TechnicianDashboardModal
          technician={viewingTechnician}
          onClose={() => setViewingTechnician(null)}
        />
      )}
    </div>
  )
}
