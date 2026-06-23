import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import {
  Users,
  UserCog,
  Package,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  XCircle,
  Boxes,
  Archive,
} from 'lucide-react'
import StatCard from '../../components/Cards/StatCard'
import DataTable from '../../components/Tables/DataTable'
import StatusBadge from '../../components/Tables/StatusBadge'
import LoadingData from '../../components/Loading/LoadingData'
import { useData } from '../../context/useData'
import { apiRequest } from '../../utils/sheetsApi'

function groupCount(items, keyFn) {
  const map = new Map()
  items.forEach((item) => {
    const key = keyFn(item)
    map.set(key, (map.get(key) || 0) + 1)
  })
  return map
}

function normalizeStatus(status = '') {
  return String(status).trim().toUpperCase()
}

function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-gray-500">{title}</p>
          <h3 className="mt-4 text-3xl font-bold text-gray-900">{value}</h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export default function AdminOverview() {
  const { technicians, transactions, loading, error } = useData()
  const [materials, setMaterials] = useState([])
  const [jobOrders, setJobOrders] = useState([])
  const [repairTickets, setRepairTickets] = useState([])

  useEffect(() => {
    apiRequest('getMaterialStocks')
      .then((res) => setMaterials(res.materialStocks || []))
      .catch(() => setMaterials([]))
    apiRequest('getJobOrders')
      .then((res) => setJobOrders(res.jobOrders || []))
      .catch(() => setJobOrders([]))
    apiRequest('getRepairTickets')
      .then((res) => setRepairTickets(res.repairTickets || []))
      .catch(() => setRepairTickets([]))
  }, [])

  const completed = transactions.filter((t) => t.status === 'Completed').length
  const pending = transactions.filter((t) => t.status === 'Pending').length

  const prOutput = useMemo(
    () => ({
      completed: jobOrders.filter((item) => normalizeStatus(item.status) === 'COMPLETED').length,
      ongoing: jobOrders.filter((item) =>
        ['ONGOING', 'IN PROGRESS', 'DISPATCHED'].includes(normalizeStatus(item.status))
      ).length,
      forClosing: jobOrders.filter((item) => normalizeStatus(item.status) === 'FOR CLOSING').length,
      unattended: jobOrders.filter((item) =>
        ['UNATTENDED', 'UNATTEDED'].includes(normalizeStatus(item.status))
      ).length,
      noEndButton: jobOrders.filter(
        (item) =>
          normalizeStatus(item.status) === 'NO END BUTTON' ||
          item.noEndButton === true ||
          item.endButtonStatus === 'No End Button'
      ).length,
    }),
    [jobOrders]
  )

  const warOutput = useMemo(
    () => ({
      completed: repairTickets.filter((item) => normalizeStatus(item.status) === 'COMPLETED').length,
      ongoing: repairTickets.filter((item) =>
        ['ONGOING', 'IN PROGRESS', 'DISPATCHED'].includes(normalizeStatus(item.status))
      ).length,
      forClosing: repairTickets.filter((item) => normalizeStatus(item.status) === 'FOR CLOSING').length,
      unattended: repairTickets.filter((item) =>
        ['UNATTENDED', 'UNATTEDED'].includes(normalizeStatus(item.status))
      ).length,
    }),
    [repairTickets]
  )

  const materialsSummary = useMemo(
    () => ({
      allMaterials: materials.length,
      available: materials.filter((item) => ['AVAILABLE', 'ON HAND'].includes(normalizeStatus(item.status)))
        .length,
      used: materials.filter((item) => normalizeStatus(item.status) === 'USED').length,
    }),
    [materials]
  )

  const transactionsPerDay = useMemo(() => {
    const counts = groupCount(transactions, (t) =>
      new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    )
    return Array.from(counts.entries())
      .map(([date, count]) => ({ date, count }))
      .slice(-10)
  }, [transactions])

  const submissionsByTechnician = useMemo(() => {
    const counts = groupCount(transactions, (t) => t.technicianName)
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
  }, [transactions])

  const inventorySummary = useMemo(() => {
    const sums = new Map()
    materials.forEach((m) => {
      sums.set(m.materialName, (sums.get(m.materialName) || 0) + Number(m.quantity || 0))
    })
    return Array.from(sums.entries()).map(([category, quantity]) => ({ category, quantity }))
  }, [materials])

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  const columns = [
    { key: 'id', label: 'Transaction ID' },
    { key: 'technicianName', label: 'Technician' },
    { key: 'subscriber', label: 'Subscriber' },
    { key: 'focPrefabSerial', label: 'Serial Number' },
    {
      key: 'distance',
      label: 'Distance (m)',
      render: (row) => row.geotagging?.distanceMeters || '—',
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'createdAt',
      label: 'Date Submitted',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Overview</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Subscribers" value={transactions.length} icon={Users} accent />
        <StatCard label="Total Technicians" value={technicians.length} icon={UserCog} />
        <StatCard label="Total Materials" value={materials.length} icon={Package} />
        <StatCard label="Total Transactions" value={transactions.length} icon={ClipboardList} />
        <StatCard label="Completed Forms" value={completed} icon={CheckCircle2} />
        <StatCard label="Pending Forms" value={pending} icon={Clock} />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Total Output (PR)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard title="Completed" value={prOutput.completed} icon={CheckCircle} />
          <SummaryCard title="Ongoing" value={prOutput.ongoing} icon={Clock} />
          <SummaryCard title="For Closing" value={prOutput.forClosing} icon={FileCheck} />
          <SummaryCard title="Unattended" value={prOutput.unattended} icon={AlertTriangle} />
          <SummaryCard title="No End Button" value={prOutput.noEndButton} icon={XCircle} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Total Output (WAR)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="Completed" value={warOutput.completed} icon={CheckCircle} />
          <SummaryCard title="Ongoing" value={warOutput.ongoing} icon={Clock} />
          <SummaryCard title="For Closing" value={warOutput.forClosing} icon={FileCheck} />
          <SummaryCard title="Unattended" value={warOutput.unattended} icon={AlertTriangle} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Materials Summary</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard title="All Materials" value={materialsSummary.allMaterials} icon={Package} />
          <SummaryCard title="Available" value={materialsSummary.available} icon={Boxes} />
          <SummaryCard title="Used" value={materialsSummary.used} icon={Archive} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Transactions per Day</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={transactionsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#ea580c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Submissions by Technician</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={submissionsByTechnician}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#dc2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
          <p className="mb-3 text-sm font-semibold text-gray-700">Inventory Summary</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={inventorySummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">Last Transactions</p>
        {loading ? (
          <LoadingData />
        ) : (
          <DataTable columns={columns} rows={sortedTransactions} pageSize={10} />
        )}
      </div>
    </div>
  )
}
