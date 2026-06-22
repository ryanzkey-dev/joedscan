import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import DataTable from '../../../components/Tables/DataTable'
import StatusBadge from '../../../components/Tables/StatusBadge'
import AddStockModal from '../../../components/Modals/AddStockModal'
import { useAuth } from '../../../context/useAuth'
import { apiRequest } from '../../../utils/sheetsApi'

const STATUS_OPTIONS = ['All', 'Available', 'On Hand', 'Used', 'Transferred', 'Damaged', 'Lost']
const OWNER_TYPE_OPTIONS = ['All', 'Admin', 'Technician']

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function Inventory() {
  const { user } = useAuth()
  const [stocks, setStocks] = useState([])
  const [catalog, setCatalog] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showAddStock, setShowAddStock] = useState(false)

  const [search, setSearch] = useState('')
  const [materialFilter, setMaterialFilter] = useState('All')
  const [ownerTypeFilter, setOwnerTypeFilter] = useState('All')
  const [technicianFilter, setTechnicianFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [stocksRes, catalogRes, techRes] = await Promise.all([
        apiRequest('getMaterialStocks'),
        apiRequest('getMaterialCatalog'),
        apiRequest('getTechnicians'),
      ])
      setStocks(stocksRes.materialStocks || [])
      setCatalog((catalogRes.materialCatalog || []).filter((m) => m.status !== 'Inactive'))
      setTechnicians(techRes.technicians || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAddStock = async (payload) => {
    await apiRequest('addMaterialStock', { ...payload, userId: user.id, userName: user.fullName })
    await load()
    setShowAddStock(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return stocks.filter((s) => {
      const matchesSearch =
        !term ||
        s.materialName?.toLowerCase().includes(term) ||
        s.serialNumber?.toLowerCase().includes(term) ||
        s.currentOwnerName?.toLowerCase().includes(term) ||
        s.status?.toLowerCase().includes(term)
      const matchesMaterial = materialFilter === 'All' || s.catalogId === materialFilter
      const matchesOwnerType = ownerTypeFilter === 'All' || s.currentOwnerType === ownerTypeFilter
      const matchesTechnician = technicianFilter === 'All' || s.currentOwnerId === technicianFilter
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter
      return matchesSearch && matchesMaterial && matchesOwnerType && matchesTechnician && matchesStatus
    })
  }, [stocks, search, materialFilter, ownerTypeFilter, technicianFilter, statusFilter])

  const columns = [
    { key: 'materialName', label: 'Material Name' },
    { key: 'serialNumber', label: 'Serial Number', render: (row) => row.serialNumber || '-' },
    { key: 'quantity', label: 'Qty' },
    { key: 'unit', label: 'Unit' },
    { key: 'currentOwnerName', label: 'Current Owner', render: (row) => row.currentOwnerName || 'Admin' },
    { key: 'currentOwnerType', label: 'Owner Type' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', label: 'Created At', render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Inventory</h1>
        <button
          type="button"
          onClick={() => setShowAddStock(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90"
        >
          <Plus size={18} />
          Add Stock
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          Stock added successfully
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by material, serial number, owner, or status"
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)} className={inputClasses}>
          <option value="All">All Materials</option>
          {catalog.map((m) => (
            <option key={m.id} value={m.id}>
              {m.materialName}
            </option>
          ))}
        </select>
        <select value={ownerTypeFilter} onChange={(e) => setOwnerTypeFilter(e.target.value)} className={inputClasses}>
          {OWNER_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)} className={inputClasses}>
          <option value="All">All Technicians</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClasses}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}

      {showAddStock && (
        <AddStockModal catalog={catalog} onSave={handleAddStock} onClose={() => setShowAddStock(false)} />
      )}
    </div>
  )
}
