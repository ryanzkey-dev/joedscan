import { useMemo } from 'react'
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
import { Users, UserCog, Package, ClipboardList, CheckCircle2, Clock } from 'lucide-react'
import StatCard from '../../components/Cards/StatCard'
import DataTable from '../../components/Tables/DataTable'
import StatusBadge from '../../components/Tables/StatusBadge'
import { getSubscribers, getTechnicians, getMaterials, getTransactions } from '../../utils/storage'

function groupCount(items, keyFn) {
  const map = new Map()
  items.forEach((item) => {
    const key = keyFn(item)
    map.set(key, (map.get(key) || 0) + 1)
  })
  return map
}

export default function AdminOverview() {
  const subscribers = getSubscribers()
  const technicians = getTechnicians()
  const materials = getMaterials()
  const transactions = getTransactions()

  const completed = transactions.filter((t) => t.status === 'Completed').length
  const pending = transactions.filter((t) => t.status === 'Pending').length

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
      sums.set(m.category, (sums.get(m.category) || 0) + Number(m.quantity || 0))
    })
    return Array.from(sums.entries()).map(([category, quantity]) => ({ category, quantity }))
  }, [materials])

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  const columns = [
    { key: 'id', label: 'Transaction ID' },
    { key: 'technicianName', label: 'Technician' },
    {
      key: 'subscriber',
      label: 'Subscriber',
      render: (row) => [row.firstName, row.lastName].filter(Boolean).join(' '),
    },
    { key: 'mobileNumber', label: 'Mobile Number' },
    { key: 'serialNumber', label: 'Serial Number' },
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Subscribers" value={subscribers.length} icon={Users} accent />
        <StatCard label="Total Technicians" value={technicians.length} icon={UserCog} />
        <StatCard label="Total Materials" value={materials.length} icon={Package} />
        <StatCard label="Total Transactions" value={transactions.length} icon={ClipboardList} />
        <StatCard label="Completed Forms" value={completed} icon={CheckCircle2} />
        <StatCard label="Pending Forms" value={pending} icon={Clock} />
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
        <DataTable columns={columns} rows={sortedTransactions} pageSize={10} />
      </div>
    </div>
  )
}
