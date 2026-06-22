import { useState } from 'react'
import { X } from 'lucide-react'
import SerialNumberInputs from '../Materials/SerialNumberInputs'

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function AddStockModal({ catalog, onSave, onClose }) {
  const [catalogId, setCatalogId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('')
  const [pcs, setPcs] = useState('')
  const [remarks, setRemarks] = useState('')
  const [serialNumbers, setSerialNumbers] = useState([''])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const selectedMaterial = catalog.find((m) => m.id === catalogId)

  const handleQuantityChange = (value) => {
    const qty = Math.max(1, Number(value) || 1)
    setQuantity(qty)
    if (selectedMaterial?.requiresScanner === 'Yes') {
      setSerialNumbers((prev) => {
        const next = [...prev]
        while (next.length < qty) next.push('')
        return next.slice(0, qty)
      })
    }
  }

  const handleMaterialChange = (id) => {
    setCatalogId(id)
    setSerialNumbers([''])
  }

  const handleSerialChange = (index, value) => {
    setSerialNumbers((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!catalogId) next.catalogId = 'Select a material'
    if (!quantity || quantity <= 0) next.quantity = 'Quantity must be greater than 0'
    if (!unit.trim()) next.unit = 'Unit is required'
    if (!pcs.trim()) next.pcs = 'PCS is required'

    if (selectedMaterial?.requiresScanner === 'Yes') {
      const trimmed = serialNumbers.map((s) => s.trim())
      if (trimmed.length !== quantity || trimmed.some((s) => !s)) {
        next.serialNumbers = 'Enter a serial number for each unit'
      } else if (new Set(trimmed).size !== trimmed.length) {
        next.serialNumbers = 'Serial numbers must be unique'
      }
    }

    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      await onSave({
        catalogId,
        materialName: selectedMaterial.materialName,
        requiresScanner: selectedMaterial.requiresScanner,
        quantity,
        unit: unit.trim(),
        pcs: pcs.trim(),
        serialNumbers: serialNumbers.map((s) => s.trim()),
        remarks: remarks.trim(),
      })
    } catch (err) {
      setErrors({ submit: err.message })
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Add Stock</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Select Material</label>
            <select value={catalogId} onChange={(e) => handleMaterialChange(e.target.value)} className={inputClasses}>
              <option value="">Select material</option>
              {catalog.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.materialName}
                </option>
              ))}
            </select>
            {errors.catalogId && <p className="mt-1 text-xs text-red-600">{errors.catalogId}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Unit</label>
              <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">PCS</label>
              <input type="text" value={pcs} onChange={(e) => setPcs(e.target.value)} className={inputClasses} />
            </div>
          </div>
          {(errors.quantity || errors.unit || errors.pcs) && (
            <p className="text-xs text-red-600">{errors.quantity || errors.unit || errors.pcs}</p>
          )}

          {selectedMaterial?.requiresScanner === 'Yes' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Serial Numbers</label>
              <SerialNumberInputs values={serialNumbers} onChange={handleSerialChange} error={errors.serialNumbers} />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputClasses} rows={2} />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Saving...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
