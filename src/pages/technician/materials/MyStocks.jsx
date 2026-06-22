import { useEffect, useState } from 'react'
import { Eye, CheckCircle2, AlertCircle } from 'lucide-react'
import DataTable from '../../../components/Tables/DataTable'
import StatusBadge from '../../../components/Tables/StatusBadge'
import RecordDetailsModal from '../../../components/Modals/RecordDetailsModal'
import { useAuth } from '../../../context/useAuth'
import { apiRequest } from '../../../utils/sheetsApi'

export default function MyStocks() {
  const { user } = useAuth()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewing, setViewing] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiRequest('getTechnicianMaterialStocks', { technicianId: user.id })
      setStocks(res.materialStocks || [])
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

  const handleMarkUsed = async (materialStockId) => {
    setError('')
    try {
      await apiRequest('updateMaterialStockStatus', {
        materialStockId,
        status: 'Used',
        userId: user.id,
        userName: user.fullName,
      })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const columns = [
    { key: 'materialName', label: 'Material Name' },
    { key: 'serialNumber', label: 'Serial Number', render: (row) => row.serialNumber || '-' },
    { key: 'quantity', label: 'Qty' },
    { key: 'unit', label: 'Unit' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'createdAt',
      label: 'Date Received',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'On Hand' && (
            <button
              type="button"
              onClick={() => handleMarkUsed(row.id)}
              className="flex items-center gap-1 rounded-lg border border-green-300 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 size={14} />
              Mark as Used
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              setViewing({
                title: 'Material Details',
                details: [
                  { label: 'Material Name', value: row.materialName },
                  { label: 'Serial Number', value: row.serialNumber },
                  { label: 'Quantity', value: row.quantity },
                  { label: 'Unit', value: row.unit },
                  { label: 'Status', value: row.status },
                  { label: 'Remarks', value: row.remarks },
                  { label: 'Date Received', value: new Date(row.createdAt).toLocaleString() },
                ],
              })
            }
            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
            aria-label="View details"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">My Stocks</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
      ) : (
        <DataTable columns={columns} rows={stocks} />
      )}

      {viewing && (
        <RecordDetailsModal title={viewing.title} details={viewing.details} onClose={() => setViewing(null)} />
      )}
    </div>
  )
}
