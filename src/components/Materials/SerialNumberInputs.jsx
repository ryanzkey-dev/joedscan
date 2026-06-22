import { useState } from 'react'
import { ScanLine } from 'lucide-react'
import BarcodeScannerModal from '../Scanner/BarcodeScannerModal'

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function SerialNumberInputs({ values, onChange, error }) {
  const [scanningIndex, setScanningIndex] = useState(null)

  const handleScanned = (text) => {
    onChange(scanningIndex, text)
    setScanningIndex(null)
  }

  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(index, e.target.value)}
            placeholder={`Serial Number ${index + 1}`}
            className={inputClasses}
          />
          <button
            type="button"
            onClick={() => setScanningIndex(index)}
            className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 px-3.5 text-white shadow-sm hover:opacity-90"
            aria-label={`Scan serial number ${index + 1}`}
          >
            <ScanLine size={18} />
          </button>
        </div>
      ))}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {scanningIndex !== null && (
        <BarcodeScannerModal onDetected={handleScanned} onClose={() => setScanningIndex(null)} />
      )}
    </div>
  )
}
