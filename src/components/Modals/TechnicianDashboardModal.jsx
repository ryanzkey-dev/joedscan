import { useEffect, useMemo, useState } from 'react'
import { X, ClipboardList, Clock, CheckCircle, Hammer, Wrench } from 'lucide-react'
import LoadingData from '../Loading/LoadingData'
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

function SummaryCard({ title, total, pr, war, icon: Icon }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          <h3 className="mt-4 text-3xl font-bold text-gray-900">{total}</h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-600">
            <Hammer className="h-4 w-4 text-orange-600" />
            PR
          </span>
          <span className="font-bold">{pr}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-600">
            <Wrench className="h-4 w-4 text-red-600" />
            WAR
          </span>
          <span className="font-bold">{war}</span>
        </div>
      </div>
    </div>
  )
}

export default function TechnicianDashboardModal({ technician, onClose }) {
  const [jobOrders, setJobOrders] = useState([])
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const today = useMemo(() => new Date(), [])
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [jobOrdersRes, repairsRes] = await Promise.all([
          apiRequest('getTechnicianJobOrders', { technicianId: technician.id }),
          apiRequest('getTechnicianRepairTickets', { technicianId: technician.id }),
        ])
        setJobOrders(jobOrdersRes.jobOrders || [])
        setRepairs(repairsRes.repairTickets || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
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

  const dashboardCards = [
    { title: 'TOTAL JOB ORDER', total: summary.total, pr: summary.prTotal, war: summary.warTotal, icon: ClipboardList },
    { title: 'PENDING', total: summary.totalPending, pr: summary.prPending, war: summary.warPending, icon: Clock },
    { title: 'COMPLETED', total: summary.totalCompleted, pr: summary.prCompleted, war: summary.warCompleted, icon: CheckCircle },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{technician.fullName} Dashboard</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        )}

        <div className="mb-4 flex justify-end gap-2">
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

        {loading ? (
          <LoadingData />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {dashboardCards.map((card) => (
              <SummaryCard
                key={card.title}
                title={card.title}
                total={card.total}
                pr={card.pr}
                war={card.war}
                icon={card.icon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
