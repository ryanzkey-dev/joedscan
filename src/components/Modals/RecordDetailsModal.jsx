import { X } from 'lucide-react'

export default function RecordDetailsModal({ title, details = [], onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <dl className="space-y-2 text-sm">
          {details.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-2">
              <dt className="text-gray-500">{label}</dt>
              <dd className="text-right font-medium text-gray-800">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
