import { useState } from 'react'
import { UserPlus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import DataTable from '../../components/Tables/DataTable'
import LoadingData from '../../components/Loading/LoadingData'
import { useData } from '../../context/useData'
import { createTechnician } from '../../utils/sheetsApi'

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

const initialForm = { fullName: '', address: '', username: '', password: '' }

export default function AddTechnician() {
  const { technicians, loading, error, refresh } = useData()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full Name is required'
    if (!form.address.trim()) next.address = 'Address is required'
    if (!form.username.trim()) next.username = 'Username is required'
    else if (
      technicians.some((t) => t.username.toLowerCase() === form.username.trim().toLowerCase())
    ) {
      next.username = 'Username is already taken'
    }
    if (!form.password.trim()) next.password = 'Password is required'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    setSubmitError('')

    try {
      await createTechnician({
        fullName: form.fullName.trim(),
        address: form.address.trim(),
        username: form.username.trim(),
        password: form.password,
        createdAt: new Date().toISOString(),
      })
      await refresh()
      setForm(initialForm)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
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

      {(submitError || error) && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {submitError || error}
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
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 px-5 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          {submitting ? 'Adding...' : 'Add Technician'}
        </button>
      </form>

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">Technician Accounts</p>
        {loading ? (
          <LoadingData />
        ) : (
          <DataTable columns={columns} rows={technicians} />
        )}
      </div>
    </div>
  )
}
