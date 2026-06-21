const STYLES = {
  Pending: 'bg-yellow-50 text-yellow-700',
  'For Review': 'bg-blue-50 text-blue-700',
  Dispatched: 'bg-blue-50 text-blue-700',
  'In Progress': 'bg-orange-50 text-orange-700',
  Completed: 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-700',
  Cancelled: 'bg-red-50 text-red-700',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        STYLES[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  )
}
