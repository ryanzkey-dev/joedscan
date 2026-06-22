import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { AlertCircle } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import StatusBadge from '../../components/Tables/StatusBadge'
import LoadingData from '../../components/Loading/LoadingData'
import { useAuth } from '../../context/useAuth'
import { useData } from '../../context/useData'
import { apiRequest } from '../../utils/sheetsApi'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const PENDING_STATUSES = ['Pending', 'Dispatched', 'In Progress']

const selectClasses =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

function StatBox({ label, value, breakdown, accent }) {
  return (
    <div
      className={`rounded-xl p-4 ${
        accent ? 'bg-gradient-to-br from-red-600 to-orange-500 text-white' : 'bg-orange-50 text-gray-800'
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wide ${accent ? 'text-white/80' : 'text-gray-500'}`}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {breakdown && (
        <p className={`mt-1 text-xs ${accent ? 'text-white/80' : 'text-gray-500'}`}>{breakdown}</p>
      )}
    </div>
  )
}

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const { transactions, loading, error } = useData()
  const myTransactions = transactions.filter((t) => t.technicianId === user.id)

  const [jobOrders, setJobOrders] = useState([])
  const [repairs, setRepairs] = useState([])
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState('')

  const today = useMemo(() => new Date(), [])
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const loadSummary = async () => {
      setSummaryLoading(true)
      setSummaryError('')
      try {
        const [jobOrdersRes, repairsRes] = await Promise.all([
          apiRequest('getTechnicianJobOrders', { technicianId: user.id }),
          apiRequest('getTechnicianRepairTickets', { technicianId: user.id }),
        ])
        setJobOrders(jobOrdersRes.jobOrders || [])
        setRepairs(repairsRes.repairTickets || [])
      } catch (err) {
        setSummaryError(err.message)
      } finally {
        setSummaryLoading(false)
      }
    }
    loadSummary()
  }, [])
  /* eslint-enable react-hooks/exhaustive-deps */

  const yearOptions = useMemo(() => {
    const startYear = 2025
    const endYear = today.getFullYear() + 1
    const years = []
    for (let y = startYear; y <= endYear; y++) years.push(y)
    return years
  }, [today])

  const summary = useMemo(() => {
    const matchesPeriod = (item) => {
      const dateValue = item.dispatchDate || item.createdAt
      if (!dateValue) return false
      const date = new Date(dateValue)
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear
    }

    const filteredJobOrders = jobOrders.filter(matchesPeriod)
    const filteredRepairs = repairs.filter(matchesPeriod)

    const prTotal = filteredJobOrders.length
    const warTotal = filteredRepairs.length

    const prPending = filteredJobOrders.filter((item) => PENDING_STATUSES.includes(item.status)).length
    const warPending = filteredRepairs.filter((item) => PENDING_STATUSES.includes(item.status)).length

    const prCompleted = filteredJobOrders.filter((item) => item.status === 'Completed').length
    const warCompleted = filteredRepairs.filter((item) => item.status === 'Completed').length

    return {
      total: prTotal + warTotal,
      prTotal,
      warTotal,
      totalPending: prPending + warPending,
      prPending,
      warPending,
      totalCompleted: prCompleted + warCompleted,
      prCompleted,
      warCompleted,
    }
  }, [jobOrders, repairs, selectedMonth, selectedYear])

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

      {summaryError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {summaryError}
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">TOTAL JOB ORDER</h2>
            <p className="text-sm text-gray-500">PR and WAR summary</p>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className={selectClasses}
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={selectClasses}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {summaryLoading ? (
          <LoadingData />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatBox label="Total" value={summary.total} accent />
            <StatBox label="PR" value={summary.prTotal} />
            <StatBox label="WAR" value={summary.warTotal} />
            <StatBox
              label="Pending"
              value={summary.totalPending}
              breakdown={`PR: ${summary.prPending} | WAR: ${summary.warPending}`}
            />
            <StatBox
              label="Completed"
              value={summary.totalCompleted}
              breakdown={`PR: ${summary.prCompleted} | WAR: ${summary.warCompleted}`}
            />
          </div>
        )}
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
          <LoadingData />
        ) : (
          <DataTable columns={columns} rows={sorted} pageSize={10} />
        )}
      </div>
    </div>
  )
}
