import { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { ClipboardList, CheckCircle2, Clock, CalendarCheck, AlertCircle } from 'lucide-react'
import StatCard from '../../components/Cards/StatCard'
import DataTable from '../../components/Tables/DataTable'
import StatusBadge from '../../components/Tables/StatusBadge'
import { useAuth } from '../../context/useAuth'
import { useData } from '../../context/useData'

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const { transactions, loading, error } = useData()
  const myTransactions = transactions.filter((t) => t.technicianId === user.id)

  const completed = myTransactions.filter((t) => t.status === 'Completed').length
  const pending = myTransactions.filter((t) => t.status === 'Pending').length
  const today = new Date()
  const todaysSubmissions = myTransactions.filter((t) => isSameDay(new Date(t.createdAt), today))
    .length

  const submissionsPerDay = useMemo(() => {
    const map = new Map()
    myTransactions.forEach((t) => {
      const key = new Date(t.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries()).map(([date, count]) => ({ date, count })).slice(-10)
  }, [myTransactions])

  const sorted = [...myTransactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const columns = [
    { key: 'id', label: 'Transaction ID' },
    { key: 'subscriber', label: 'Subscriber' },
    { key: 'focPrefabSerial', label: 'Serial Number' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'createdAt',
      label: 'Date Submitted',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">My Dashboard</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="My Total Encoded Forms"
          value={myTransactions.length}
          icon={ClipboardList}
          accent
        />
        <StatCard label="My Completed Forms" value={completed} icon={CheckCircle2} />
        <StatCard label="My Pending Forms" value={pending} icon={Clock} />
        <StatCard label="Today's Submissions" value={todaysSubmissions} icon={CalendarCheck} />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">My Submissions per Day</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={submissionsPerDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#ea580c" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">My Recent Records</p>
        {loading ? (
          <p className="text-sm text-gray-400">Loading from Google Sheet...</p>
        ) : (
          <DataTable columns={columns} rows={sorted} pageSize={10} />
        )}
      </div>
    </div>
  )
}
