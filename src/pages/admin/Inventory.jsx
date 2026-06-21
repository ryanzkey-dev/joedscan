import { useState } from 'react'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import StatCard from '../../components/Cards/StatCard'
import DataTable from '../../components/Tables/DataTable'
import AddMaterialModal from '../../components/Modals/AddMaterialModal'
import { getMaterials, addMaterial, updateMaterial, deleteMaterial } from '../../utils/storage'

const LOW_STOCK_THRESHOLD = 5

export default function Inventory() {
  const [materials, setMaterials] = useState(() => getMaterials())
  const [modalState, setModalState] = useState(null) // null | 'add' | material object

  const lowStockCount = materials.filter((m) => m.quantity <= LOW_STOCK_THRESHOLD).length

  const handleSave = (form) => {
    if (modalState && modalState !== 'add') {
      updateMaterial(modalState.id, form)
    } else {
      addMaterial(form)
    }
    setMaterials(getMaterials())
    setModalState(null)
  }

  const handleDelete = (id) => {
    deleteMaterial(id)
    setMaterials(getMaterials())
  }

  const columns = [
    { key: 'id', label: 'Material ID' },
    { key: 'materialName', label: 'Material Name' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit', label: 'Unit' },
    { key: 'serialNumber', label: 'Serial Number', render: (row) => row.serialNumber || '—' },
    { key: 'remarks', label: 'Remarks', render: (row) => row.remarks || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (row) =>
        row.quantity <= LOW_STOCK_THRESHOLD ? (
          <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
            Low Stock
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
            In Stock
          </span>
        ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModalState(row)}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
            aria-label="Edit material"
          >
            <Edit size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="rounded-lg border border-gray-200 p-1.5 text-red-600 hover:bg-red-50"
            aria-label="Delete material"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Inventory / Materials</h1>
        <button
          type="button"
          onClick={() => setModalState('add')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90"
        >
          <Plus size={18} />
          Add Material
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total Materials" value={materials.length} icon={Package} accent />
        <StatCard label="Low Stock Items" value={lowStockCount} icon={Package} />
      </div>

      <DataTable columns={columns} rows={materials} />

      {modalState && (
        <AddMaterialModal
          material={modalState === 'add' ? null : modalState}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  )
}
