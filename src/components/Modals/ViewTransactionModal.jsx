import { X, Image as ImageIcon } from 'lucide-react'
import StatusBadge from '../Tables/StatusBadge'

const STATUS_OPTIONS = ['Pending', 'For Review', 'Completed', 'Rejected']

export default function ViewTransactionModal({ transaction, onClose, onStatusChange }) {
  if (!transaction) return null
  const { geotagging } = transaction

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Transaction {transaction.id}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <section>
            <h4 className="mb-1.5 text-xs font-semibold uppercase text-gray-400">
              Technician Information
            </h4>
            <p className="text-gray-700">{transaction.technicianName}</p>
            <p className="text-xs text-gray-400">{transaction.technicianId}</p>
          </section>

          <section>
            <h4 className="mb-1.5 text-xs font-semibold uppercase text-gray-400">
              Subscriber Information
            </h4>
            <p className="text-gray-700">
              {[transaction.firstName, transaction.middleName, transaction.lastName]
                .filter(Boolean)
                .join(' ')}
            </p>
            <p className="text-gray-500">{transaction.mobileNumber}</p>
            <p className="text-gray-500">{transaction.address}</p>
          </section>

          <section>
            <h4 className="mb-1.5 text-xs font-semibold uppercase text-gray-400">
              Serial Barcode
            </h4>
            <p className="font-mono text-gray-700">{transaction.serialNumber}</p>
          </section>

          <section>
            <h4 className="mb-1.5 text-xs font-semibold uppercase text-gray-400">
              Geotagging
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">Start</p>
                {geotagging?.start?.imagePreview ? (
                  <img
                    src={geotagging.start.imagePreview}
                    alt="Start geotag"
                    className="h-28 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                    <ImageIcon size={24} />
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {geotagging?.start?.latitude}, {geotagging?.start?.longitude}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">End</p>
                {geotagging?.end?.imagePreview ? (
                  <img
                    src={geotagging.end.imagePreview}
                    alt="End geotag"
                    className="h-28 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                    <ImageIcon size={24} />
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {geotagging?.end?.latitude}, {geotagging?.end?.longitude}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-orange-700">
              Distance: {geotagging?.distanceMeters || '—'} m (
              {geotagging?.distanceKilometers || '—'} km)
            </p>
          </section>

          <section className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-400">Status</h4>
              {onStatusChange ? (
                <select
                  value={transaction.status}
                  onChange={(e) => onStatusChange(transaction.id, e.target.value)}
                  className="mt-1 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-1">
                  <StatusBadge status={transaction.status} />
                </div>
              )}
            </div>
            <div className="text-right">
              <h4 className="text-xs font-semibold uppercase text-gray-400">Date Submitted</h4>
              <p className="text-sm text-gray-700">
                {new Date(transaction.createdAt).toLocaleString()}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
