const STYLES = {
  Pending: 'bg-yellow-50 text-yellow-700',
  'For Review': 'bg-blue-50 text-blue-700',
  Dispatched: 'bg-blue-50 text-blue-700',
  'In Progress': 'bg-orange-50 text-orange-700',
  Completed: 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-700',
  Cancelled: 'bg-red-50 text-red-700',
  Available: 'bg-green-50 text-green-700',
  'On Hand': 'bg-blue-50 text-blue-700',
  Used: 'bg-gray-100 text-gray-600',
  Transferred: 'bg-orange-50 text-orange-700',
  Damaged: 'bg-red-50 text-red-700',
  Lost: 'bg-red-50 text-red-700',
  Inactive: 'bg-gray-100 text-gray-600',
}

export default function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        STYLES[status] || 'bg-gray-100 text-gray-600'
      } ${className}`}
    >
      {status}
    </span>
  )
}
