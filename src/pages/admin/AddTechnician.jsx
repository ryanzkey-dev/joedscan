import { useState } from 'react'
import { UserPlus, CheckCircle2 } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import { addTechnician, getTechnicians, isUsernameTaken } from '../../utils/storage'

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

const initialForm = { fullName: '', address: '', username: '', password: '' }

export default function AddTechnician() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [technicians, setTechnicians] = useState(() => getTechnicians())
  const [success, setSuccess] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full Name is required'
    if (!form.address.trim()) next.address = 'Address is required'
    if (!form.username.trim()) next.username = 'Username is required'
    else if (isUsernameTaken(form.username.trim())) next.username = 'Username is already taken'
    if (!form.password.trim()) next.password = 'Password is required'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    addTechnician({
      fullName: form.fullName.trim(),
      address: form.address.trim(),
      username: form.username.trim(),
      password: form.password,
    })

    setTechnicians(getTechnicians())
    setForm(initialForm)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const columns = [
    { key: 'id', label: 'Technician ID' },
    { key: 'fullName', label: 'Full Name' },
    { key: 'address', label: 'Address' },
    { key: 'username', label: 'Username' },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Add Technician</h1>

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          Technician account created successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={handleChange('fullName')}
              className={inputClasses}
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.address}
              onChange={handleChange('address')}
              className={inputClasses}
            />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.username}
              onChange={handleChange('username')}
              className={inputClasses}
            />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              className={inputClasses}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 px-5 py-2.5 font-semibold text-white shadow-md hover:opacity-90"
        >
          <UserPlus size={18} />
          Add Technician
        </button>
      </form>

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">Technician Accounts</p>
        <DataTable columns={columns} rows={technicians} />
      </div>
    </div>
  )
}
