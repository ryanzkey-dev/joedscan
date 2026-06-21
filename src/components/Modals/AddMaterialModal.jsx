import { useState } from 'react'
import { X } from 'lucide-react'

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function AddMaterialModal({ material, onSave, onClose }) {
  const isEdit = Boolean(material)
  const [form, setForm] = useState({
    materialName: material?.materialName || '',
    category: material?.category || '',
    quantity: material?.quantity ?? '',
    unit: material?.unit || '',
    serialNumber: material?.serialNumber || '',
    remarks: material?.remarks || '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.materialName.trim()) next.materialName = 'Material Name is required'
    if (!form.category.trim()) next.category = 'Category is required'
    if (form.quantity === '' || Number.isNaN(Number(form.quantity))) {
      next.quantity = 'Quantity is required'
    }
    if (!form.unit.trim()) next.unit = 'Unit is required'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Material' : 'Add Material'}
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Material Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.materialName}
              onChange={handleChange('materialName')}
              className={inputClasses}
            />
            {errors.materialName && (
              <p className="mt-1 text-xs text-red-600">{errors.materialName}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.category}
              onChange={handleChange('category')}
              className={inputClasses}
            />
            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={handleChange('quantity')}
                className={inputClasses}
              />
              {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={handleChange('unit')}
                className={inputClasses}
                placeholder="pcs, meters..."
              />
              {errors.unit && <p className="mt-1 text-xs text-red-600">{errors.unit}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Serial Number</label>
            <input
              type="text"
              value={form.serialNumber}
              onChange={handleChange('serialNumber')}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={handleChange('remarks')}
              className={inputClasses}
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 py-2.5 font-semibold text-white shadow-md hover:opacity-90"
          >
            {isEdit ? 'Save Changes' : 'Add Material'}
          </button>
        </form>
      </div>
    </div>
  )
}
