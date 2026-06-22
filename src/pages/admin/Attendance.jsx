import { useEffect, useMemo, useState } from 'react'
import { Search, Eye, AlertCircle, CheckCircle, XCircle, Calendar, ExternalLink } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import StatCard from '../../components/Cards/StatCard'
import AttendanceDetailsModal from '../../components/Attendance/AttendanceDetailsModal'
import { apiRequest } from '../../utils/sheetsApi'
import { getManilaTimeNow, toDateKey, formatDisplayDate } from '../../utils/manilaTime'

const DISPATCH_FILTER_OPTIONS = ['All', 'WAR', 'PR', 'Other']
const STATUS_FILTER_OPTIONS = ['All', 'On Time', 'Late']

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function AdminAttendance() {
  const todayKey = toDateKey(getManilaTimeNow())

  const [attendances, setAttendances] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewing, setViewing] = useState(null)

  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [technicianFilter, setTechnicianFilter] = useState('All')
  const [dispatchFilter, setDispatchFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [attRes, techRes] = await Promise.all([
        apiRequest('getAttendances'),
        apiRequest('getTechnicians'),
      ])
      setAttendances(attRes.attendances || [])
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

  const totalOnTime = attendances.filter((a) => a.timeInStatus === 'On Time').length
  const totalLate = attendances.filter((a) => a.timeInStatus === 'Late').length
  const todayCount = attendances.filter((a) => a.date === todayKey).length

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return attendances.filter((a) => {
      const matchesSearch =
        !term ||
        a.technicianName?.toLowerCase().includes(term) ||
        a.dispatchType?.toLowerCase().includes(term) ||
        a.dispatchOtherText?.toLowerCase().includes(term) ||
        a.remarks?.toLowerCase().includes(term)
      const matchesDate = !dateFilter || a.date === dateFilter
      const matchesTechnician = technicianFilter === 'All' || a.technicianId === technicianFilter
      const matchesDispatch = dispatchFilter === 'All' || a.dispatchType === dispatchFilter
      const matchesStatus = statusFilter === 'All' || a.timeInStatus === statusFilter
      return matchesSearch && matchesDate && matchesTechnician && matchesDispatch && matchesStatus
    })
  }, [attendances, search, dateFilter, technicianFilter, dispatchFilter, statusFilter])

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (row) => (row.date ? formatDisplayDate(new Date(row.date)) : '-'),
    },
    { key: 'technicianName', label: 'Technician' },
    {
      key: 'dispatchType',
      label: 'Dispatch',
      render: (row) => (row.dispatchType === 'Other' ? row.dispatchOtherText : row.dispatchType),
    },
    { key: 'timeIn', label: 'Time In' },
    {
      key: 'timeInStatus',
      label: 'Status',
      render: (row) =>
        row.timeInStatus === 'Late' ? (
          <span className="animate-pulse rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
            LATE
          </span>
        ) : (
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">ON TIME</span>
        ),
    },
    {
      key: 'lateMinutes',
      label: 'Late Minutes',
      render: (row) => (row.timeInStatus === 'Late' ? `${row.lateMinutes} MINUTES` : '-'),
    },
    {
      key: 'location',
      label: 'Location',
      render: (row) =>
        row.latitude && row.longitude ? (
          <a
            href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-orange-700 underline"
          >
            View Map <ExternalLink size={12} />
          </a>
        ) : (
          '-'
        ),
    },
    {
      key: 'attendanceImageUrl',
      label: 'Photo',
      render: (row) =>
        row.attendanceImageUrl ? (
          <a href={row.attendanceImageUrl} target="_blank" rel="noreferrer">
            <img src={row.attendanceImageUrl} alt="Attendance" className="h-10 w-10 rounded object-cover" />
          </a>
        ) : (
          '-'
        ),
    },
    {
      key: 'badWeatherProofUrl',
      label: 'Proof',
      render: (row) =>
        row.badWeatherProofUrl ? (
          <a href={row.badWeatherProofUrl} target="_blank" rel="noreferrer">
            <img src={row.badWeatherProofUrl} alt="Proof" className="h-10 w-10 rounded object-cover" />
          </a>
        ) : (
          'No Proof'
        ),
    },
    { key: 'remarks', label: 'Remarks', render: (row) => row.remarks || '-' },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewing(row)}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
          aria-label="View attendance details"
        >
          <Eye size={14} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Attendance</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Attendance" value={attendances.length} icon={Calendar} accent />
        <StatCard label="On Time" value={totalOnTime} icon={CheckCircle} />
        <StatCard label="Late" value={totalLate} icon={XCircle} />
        <StatCard label="Today Attendance" value={todayCount} icon={Calendar} />
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by technician, dispatch type, or remarks"
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={inputClasses} />
        <select value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)} className={inputClasses}>
          <option value="All">All Technicians</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </select>
        <select value={dispatchFilter} onChange={(e) => setDispatchFilter(e.target.value)} className={inputClasses}>
          {DISPATCH_FILTER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClasses}>
          {STATUS_FILTER_OPTIONS.map((opt) => (
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

      {viewing && <AttendanceDetailsModal record={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}
