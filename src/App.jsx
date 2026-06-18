import { useCallback, useState } from 'react'
import { ScanLine, CheckCircle2 } from 'lucide-react'
import FormField from './components/FormField'
import BarcodeScannerModal from './components/BarcodeScannerModal'

const initialForm = {
  date: '',
  techNames: '',
  projectId: '',
  subscriber: '',
  address: '',
  focPrefabSerial: '',
  modem: '',
  telset: '',
  iptvCcaNo: '',
}

const fieldLabels = {
  date: 'Date',
  techNames: 'Tech Names',
  projectId: 'Project ID',
  subscriber: 'Subscriber',
  address: 'Address',
  focPrefabSerial: 'FOC Prefab Serial',
  modem: 'Modem',
  telset: 'Telset',
  iptvCcaNo: 'IPTV CCA No.',
}

const scanFields = ['focPrefabSerial', 'modem', 'telset', 'iptvCcaNo']

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

function App() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [activeScanField, setActiveScanField] = useState(null)
  const [scanSuccessField, setScanSuccessField] = useState(null)
  const [submittedData, setSubmittedData] = useState(null)

  const handleChange = (field) => (e) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleBarcodeDetected = useCallback(
    (text) => {
      setForm((prev) => ({ ...prev, [activeScanField]: text }))
      setScanSuccessField(activeScanField)
      setActiveScanField(null)
      setTimeout(() => setScanSuccessField(null), 3000)
    },
    [activeScanField]
  )

  const validate = () => {
    const next = {}
    Object.keys(initialForm).forEach((field) => {
      if (!form[field].trim()) {
        next[field] = `${fieldLabels[field]} is required`
      }
    })
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
          {scanSuccessField && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <CheckCircle2 size={18} />
              Serial barcode scanned successfully
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label={fieldLabels.date} required error={errors.date}>
              <input
                type="date"
                value={form.date}
                onChange={handleChange('date')}
                className={inputClasses}
              />
            </FormField>

            <FormField label={fieldLabels.techNames} required error={errors.techNames}>
              <input
                type="text"
                value={form.techNames}
                onChange={handleChange('techNames')}
                className={inputClasses}
                placeholder="Juan Dela Cruz"
              />
            </FormField>

            <FormField label={fieldLabels.projectId} required error={errors.projectId}>
              <input
                type="text"
                value={form.projectId}
                onChange={handleChange('projectId')}
                className={inputClasses}
                placeholder="PRJ-00123"
              />
            </FormField>

            <FormField label={fieldLabels.subscriber} required error={errors.subscriber}>
              <input
                type="text"
                value={form.subscriber}
                onChange={handleChange('subscriber')}
                className={inputClasses}
                placeholder="Subscriber name"
              />
            </FormField>

            <FormField label={fieldLabels.address} required error={errors.address}>
              <input
                type="text"
                value={form.address}
                onChange={handleChange('address')}
                className={inputClasses}
                placeholder="Installation address"
              />
            </FormField>

            {scanFields.map((field) => (
              <FormField key={field} label={fieldLabels[field]} required error={errors[field]}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form[field]}
                    onChange={handleChange(field)}
                    className={inputClasses}
                    placeholder={`Scan or enter ${fieldLabels[field].toLowerCase()}`}
                  />
                  <button
                    type="button"
                    onClick={() => setActiveScanField(field)}
                    className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 px-3.5 text-white shadow-sm transition hover:opacity-90"
                    aria-label={`Scan ${fieldLabels[field]}`}
                  >
                    <ScanLine size={22} />
                  </button>
                </div>
              </FormField>
            ))}

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
              {Object.keys(initialForm).map((field) => (
                <div key={field} className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                  <dt className="text-gray-500">{fieldLabels[field]}</dt>
                  <dd className="font-medium text-gray-800">{submittedData[field]}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {activeScanField && (
        <BarcodeScannerModal
          onDetected={handleBarcodeDetected}
          onClose={() => setActiveScanField(null)}
        />
      )}
    </div>
  )
}

export default App
