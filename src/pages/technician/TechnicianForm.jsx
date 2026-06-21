import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanLine, CheckCircle2, AlertCircle } from 'lucide-react'
import FormField from '../../components/FormField'
import BarcodeScannerModal from '../../components/Scanner/BarcodeScannerModal'
import { useAuth } from '../../context/useAuth'
import { calculateDistanceInMeters } from '../../utils/distance'
import { addTransaction } from '../../utils/storage'
import { submitToSheet } from '../../utils/submitToSheet'

const initialForm = {
  date: '',
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
  projectId: 'Project ID',
  subscriber: 'Subscriber',
  address: 'Address',
  focPrefabSerial: 'FOC Traditional / Prefab Serial',
  modem: 'Modem',
  telset: 'Telset',
  iptvCcaNo: 'IPTV CCA No.',
}

const scanFields = ['focPrefabSerial', 'modem', 'telset', 'iptvCcaNo']

const initialGeotagging = {
  start: { latitude: '', longitude: '' },
  end: { latitude: '', longitude: '' },
}

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function TechnicianForm() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [geotagging, setGeotagging] = useState(initialGeotagging)
  const [errors, setErrors] = useState({})
  const [activeScanField, setActiveScanField] = useState(null)
  const [scanSuccessField, setScanSuccessField] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [sheetError, setSheetError] = useState('')

  const distance = useMemo(() => {
    const { start, end } = geotagging
    if (start.latitude && start.longitude && end.latitude && end.longitude) {
      const meters = calculateDistanceInMeters(
        parseFloat(start.latitude),
        parseFloat(start.longitude),
        parseFloat(end.latitude),
        parseFloat(end.longitude)
      )
      return {
        distanceMeters: meters.toFixed(2),
        distanceKilometers: (meters / 1000).toFixed(3),
      }
    }
    return { distanceMeters: '', distanceKilometers: '' }
  }, [geotagging.start.latitude, geotagging.start.longitude, geotagging.end.latitude, geotagging.end.longitude])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const updateGeotagField = (point, field) => (e) => {
    const { value } = e.target
    setGeotagging((prev) => ({
      ...prev,
      [point]: { ...prev[point], [field]: value },
    }))
  }

  const handleBarcodeDetected = (text) => {
    setForm((prev) => ({ ...prev, [activeScanField]: text }))
    setScanSuccessField(activeScanField)
    setActiveScanField(null)
    setTimeout(() => setScanSuccessField(null), 3000)
  }

  const validate = () => {
    const next = {}
    Object.keys(initialForm).forEach((field) => {
      if (!form[field].trim()) {
        next[field] = `${fieldLabels[field]} is required`
      }
    })

    if (!geotagging.start.latitude || !geotagging.start.longitude) {
      next.startGeotag = 'Start Latitude and Longitude are required'
    }
    if (!geotagging.end.latitude || !geotagging.end.longitude) {
      next.endGeotag = 'End Latitude and Longitude are required'
    }
    if (!distance.distanceMeters) next.distance = 'Distance must be computed'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    addTransaction({
      technicianId: user.id,
      technicianName: user.fullName,
      ...form,
      geotagging: { ...geotagging, ...distance },
    })

    setSubmitSuccess(true)
    setSheetError('')

    let syncFailed = false
    try {
      await submitToSheet({
        date: form.date,
        techNames: user.fullName,
        projectId: form.projectId,
        subscriber: form.subscriber,
        address: form.address,
        focPrefabSerial: form.focPrefabSerial,
        modem: form.modem,
        telset: form.telset,
        iptvCcaNo: form.iptvCcaNo,
        startLatitude: geotagging.start.latitude,
        startLongitude: geotagging.start.longitude,
        endLatitude: geotagging.end.latitude,
        endLongitude: geotagging.end.longitude,
        distanceMeters: distance.distanceMeters,
        distanceKilometers: distance.distanceKilometers,
      })
    } catch (err) {
      syncFailed = true
      setSheetError(`Saved locally, but could not sync to Google Sheet: ${err.message}`)
    }

    setForm(initialForm)
    setGeotagging(initialGeotagging)
    setErrors({})

    if (!syncFailed) {
      setTimeout(() => navigate('/technician/records'), 1200)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Encoding Form</h1>

      {scanSuccessField && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          Serial barcode scanned successfully
        </div>
      )}

      {submitSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          Form submitted successfully. Redirecting to My Encoded Records...
        </div>
      )}

      {sheetError && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          <AlertCircle size={18} />
          {sheetError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-5 shadow-sm">
        <section className="rounded-xl border border-gray-200 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Geotagging
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Latitude">
                <input
                  type="text"
                  inputMode="decimal"
                  value={geotagging.start.latitude}
                  onChange={updateGeotagField('start', 'latitude')}
                  className={inputClasses}
                  placeholder="9.763115"
                />
              </FormField>
              <FormField label="Start Longitude">
                <input
                  type="text"
                  inputMode="decimal"
                  value={geotagging.start.longitude}
                  onChange={updateGeotagField('start', 'longitude')}
                  className={inputClasses}
                  placeholder="123.530931"
                />
              </FormField>
            </div>
            {errors.startGeotag && <p className="text-xs text-red-600">{errors.startGeotag}</p>}

            <div className="grid grid-cols-2 gap-3">
              <FormField label="End Latitude">
                <input
                  type="text"
                  inputMode="decimal"
                  value={geotagging.end.latitude}
                  onChange={updateGeotagField('end', 'latitude')}
                  className={inputClasses}
                  placeholder="9.764000"
                />
              </FormField>
              <FormField label="End Longitude">
                <input
                  type="text"
                  inputMode="decimal"
                  value={geotagging.end.longitude}
                  onChange={updateGeotagField('end', 'longitude')}
                  className={inputClasses}
                  placeholder="123.531500"
                />
              </FormField>
            </div>
            {errors.endGeotag && <p className="text-xs text-red-600">{errors.endGeotag}</p>}

            <FormField label="Geotagging Distance Result">
              <input
                type="text"
                readOnly
                value={
                  distance.distanceMeters
                    ? `${distance.distanceMeters} meters  (${distance.distanceKilometers} km)`
                    : ''
                }
                placeholder="Distance will appear after both latitude/longitude pairs are entered"
                className={`${inputClasses} cursor-not-allowed bg-orange-50 font-medium text-orange-800`}
              />
            </FormField>
            {errors.distance && <p className="text-xs text-red-600">{errors.distance}</p>}
          </div>
        </section>

        <FormField label={fieldLabels.date} required error={errors.date}>
          <input
            type="date"
            value={form.date}
            onChange={handleChange('date')}
            className={inputClasses}
          />
        </FormField>

        <FormField label="Tech Names">
          <input
            type="text"
            value={user.fullName}
            readOnly
            className={`${inputClasses} cursor-not-allowed bg-gray-50`}
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
                className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 px-3.5 text-white shadow-sm hover:opacity-90"
                aria-label={`Scan ${fieldLabels[field]}`}
              >
                <ScanLine size={22} />
              </button>
            </div>
          </FormField>
        ))}

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 py-3 font-semibold text-white shadow-md hover:opacity-90"
        >
          Submit Form
        </button>
      </form>

      {activeScanField && (
        <BarcodeScannerModal
          onDetected={handleBarcodeDetected}
          onClose={() => setActiveScanField(null)}
        />
      )}
    </div>
  )
}
