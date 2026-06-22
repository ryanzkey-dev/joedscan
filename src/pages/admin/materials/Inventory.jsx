import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import DataTable from '../../../components/Tables/DataTable'
import StatusBadge from '../../../components/Tables/StatusBadge'
import AddStockModal from '../../../components/Modals/AddStockModal'
import LoadingData from '../../../components/Loading/LoadingData'
import { useAuth } from '../../../context/useAuth'
import { apiRequest } from '../../../utils/sheetsApi'

const OWNER_TYPE_OPTIONS = ['All', 'Admin', 'Technician']
const STATUS_TABS = ['AVAILABLE', 'USED']

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

function matchesStatusTab(status, statusTab) {
  if (statusTab === 'AVAILABLE') return ['Available', 'On Hand'].includes(status)
  if (statusTab === 'USED') return status === 'Used'
  return true
}

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
  const [ownerTypeFilter, setOwnerTypeFilter] = useState('All')
  const [technicianFilter, setTechnicianFilter] = useState('All')
  const [activeMaterialTab, setActiveMaterialTab] = useState('ALL')
  const [activeStatusTab, setActiveStatusTab] = useState('AVAILABLE')

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

  const catalogNames = useMemo(
    () => Array.from(new Set(stocks.map((s) => s.materialName).filter(Boolean))),
    [stocks]
  )
  const materialTabs = ['ALL', ...catalogNames]

  const byMaterial = useMemo(
    () =>
      activeMaterialTab === 'ALL'
        ? stocks
        : stocks.filter((s) => s.materialName === activeMaterialTab),
    [stocks, activeMaterialTab]
  )

  const statusTabCounts = useMemo(
    () =>
      STATUS_TABS.reduce((acc, tab) => {
        acc[tab] = byMaterial.filter((s) => matchesStatusTab(s.status, tab)).length
        return acc
      }, {}),
    [byMaterial]
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return byMaterial.filter((s) => {
      const matchesSearch =
        !term ||
        s.materialName?.toLowerCase().includes(term) ||
        s.serialNumber?.toLowerCase().includes(term) ||
        s.currentOwnerName?.toLowerCase().includes(term) ||
        s.status?.toLowerCase().includes(term)
      const matchesOwnerType = ownerTypeFilter === 'All' || s.currentOwnerType === ownerTypeFilter
      const matchesTechnician = technicianFilter === 'All' || s.currentOwnerId === technicianFilter
      const matchesStatus = matchesStatusTab(s.status, activeStatusTab)
      return matchesSearch && matchesOwnerType && matchesTechnician && matchesStatus
    })
  }, [byMaterial, search, ownerTypeFilter, technicianFilter, activeStatusTab])

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

  const emptyMessage =
    activeMaterialTab === 'ALL'
      ? `No ${activeStatusTab} materials found.`
      : `No ${activeStatusTab} materials found for ${activeMaterialTab}.`

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

      {!loading && stocks.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {materialTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveMaterialTab(tab)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                  activeMaterialTab === tab
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveStatusTab(tab)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  activeStatusTab === tab
                    ? 'border border-orange-300 bg-orange-100 text-orange-700'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab} ({statusTabCounts[tab]})
              </button>
            ))}
          </div>
        </>
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
      </div>

      {loading ? (
        <LoadingData />
      ) : stocks.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
          No materials in inventory yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm">{emptyMessage}</div>
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}

      {showAddStock && (
        <AddStockModal catalog={catalog} onSave={handleAddStock} onClose={() => setShowAddStock(false)} />
      )}
    </div>
  )
}
