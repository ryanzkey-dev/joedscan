import { useCallback, useState } from 'react'
import { ScanLine, CheckCircle2 } from 'lucide-react'
import FormField from './components/FormField'
import BarcodeScannerModal from './components/BarcodeScannerModal'

const initialForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  mobileNumber: '',
  serialNumber: '',
}

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

function App() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)

  const handleChange = (field) => (e) => {
    let { value } = e.target
    if (field === 'mobileNumber') {
      value = value.replace(/\D/g, '')
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleBarcodeDetected = useCallback((text) => {
    setForm((prev) => ({ ...prev, serialNumber: text }))
    setIsScannerOpen(false)
    setScanSuccess(true)
    setTimeout(() => setScanSuccess(false), 3000)
  }, [])

  const validate = () => {
    const next = {}
    if (!form.firstName.trim()) next.firstName = 'First name is required'
    if (!form.lastName.trim()) next.lastName = 'Last name is required'
    if (!form.mobileNumber.trim()) next.mobileNumber = 'Mobile number is required'
    if (!form.serialNumber.trim()) next.serialNumber = 'Serial number is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmittedData(form)
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-red-600 via-orange-500 to-orange-400 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <h1 className="text-2xl font-bold">Customer Registration</h1>
          <p className="mt-1 text-sm text-white/90">
            Fill in the details and scan the serial barcode
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          {scanSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <CheckCircle2 size={18} />
              Serial barcode scanned successfully
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="First Name" required error={errors.firstName}>
              <input
                type="text"
                value={form.firstName}
                onChange={handleChange('firstName')}
                className={inputClasses}
                placeholder="Juan"
              />
            </FormField>

            <FormField label="Middle Name">
              <input
                type="text"
                value={form.middleName}
                onChange={handleChange('middleName')}
                className={inputClasses}
                placeholder="Santos"
              />
            </FormField>

            <FormField label="Last Name" required error={errors.lastName}>
              <input
                type="text"
                value={form.lastName}
                onChange={handleChange('lastName')}
                className={inputClasses}
                placeholder="Dela Cruz"
              />
            </FormField>

            <FormField label="Mobile Number" required error={errors.mobileNumber}>
              <input
                type="tel"
                inputMode="numeric"
                value={form.mobileNumber}
                onChange={handleChange('mobileNumber')}
                className={inputClasses}
                placeholder="09171234567"
              />
            </FormField>

            <FormField label="Serial Number" required error={errors.serialNumber}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={handleChange('serialNumber')}
                  className={inputClasses}
                  placeholder="Scan or enter serial number"
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 px-3.5 text-white shadow-sm transition hover:opacity-90"
                  aria-label="Scan serial barcode"
                >
                  <ScanLine size={22} />
                </button>
              </div>
            </FormField>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 py-3 font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Submit Form
            </button>
          </form>
        </div>

        {submittedData && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Submitted Details
            </h2>
            <dl className="space-y-2 text-sm">
              {[
                ['First Name', submittedData.firstName],
                ['Middle Name', submittedData.middleName || '—'],
                ['Last Name', submittedData.lastName],
                ['Mobile Number', submittedData.mobileNumber],
                ['Serial Number', submittedData.serialNumber],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {isScannerOpen && (
        <BarcodeScannerModal
          onDetected={handleBarcodeDetected}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  )
}

export default App
