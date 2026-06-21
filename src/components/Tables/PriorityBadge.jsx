const STYLES = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-50 text-blue-700',
  High: 'bg-orange-50 text-orange-700',
  Urgent: 'bg-red-50 text-red-700',
}

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        STYLES[priority] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {priority}
    </span>
  )
}
