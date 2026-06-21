import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanLine, CheckCircle2 } from 'lucide-react'
import FormField from '../../components/FormField'
import BarcodeScannerModal from '../../components/Scanner/BarcodeScannerModal'
import GeoUploadCard from '../../components/Geotagging/GeoUploadCard'
import DistanceResult from '../../components/Geotagging/DistanceResult'
import { useAuth } from '../../context/useAuth'
import { calculateDistanceInMeters } from '../../utils/distance'
import { addTransaction } from '../../utils/storage'

const initialForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  mobileNumber: '',
  address: '',
  serialNumber: '',
}

const initialGeotagging = {
  start: { imagePreview: '', latitude: '', longitude: '', timestamp: '' },
  end: { imagePreview: '', latitude: '', longitude: '', timestamp: '' },
}

const inputClasses =
  'w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

export default function TechnicianForm() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [geotagging, setGeotagging] = useState(initialGeotagging)
  const [errors, setErrors] = useState({})
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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
    let { value } = e.target
    if (field === 'mobileNumber') value = value.replace(/\D/g, '')
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleBarcodeDetected = (text) => {
    setForm((prev) => ({ ...prev, serialNumber: text }))
    setScannerOpen(false)
    setScanSuccess(true)
    setTimeout(() => setScanSuccess(false), 3000)
  }

  const validate = () => {
    const next = {}
    if (!form.firstName.trim()) next.firstName = 'First Name is required'
    if (!form.lastName.trim()) next.lastName = 'Last Name is required'
    if (!form.mobileNumber.trim()) next.mobileNumber = 'Mobile Number is required'
    else if (form.mobileNumber.length < 11) next.mobileNumber = 'Mobile Number must be at least 11 digits'
    if (!form.address.trim()) next.address = 'Address is required'
    if (!form.serialNumber.trim()) next.serialNumber = 'Serial Number is required'

    if (!geotagging.start.imagePreview) next.startImage = 'Start Geotag Image is required'
    else if (!geotagging.start.latitude || !geotagging.start.longitude)
      next.startImage = 'Start Latitude/Longitude could not be detected'

    if (!geotagging.end.imagePreview) next.endImage = 'End Geotag Image is required'
    else if (!geotagging.end.latitude || !geotagging.end.longitude)
      next.endImage = 'End Latitude/Longitude could not be detected'

    if (!distance.distanceMeters) next.distance = 'Distance must be computed'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    addTransaction({
      technicianId: user.id,
      technicianName: user.fullName,
      ...form,
      geotagging: { ...geotagging, ...distance },
    })

    setSubmitSuccess(true)
    setForm(initialForm)
    setGeotagging(initialGeotagging)
    setErrors({})

    setTimeout(() => navigate('/technician/records'), 1200)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Encoding Form</h1>

      {scanSuccess && (
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

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-5 shadow-sm">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Subscriber Information
          </h2>

          <FormField label="Technician Name">
            <input
              type="text"
              value={user.fullName}
              readOnly
              className={`${inputClasses} cursor-not-allowed bg-gray-50`}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First Name" required error={errors.firstName}>
              <input
                type="text"
                value={form.firstName}
                onChange={handleChange('firstName')}
                className={inputClasses}
              />
            </FormField>
            <FormField label="Middle Name">
              <input
                type="text"
                value={form.middleName}
                onChange={handleChange('middleName')}
                className={inputClasses}
              />
            </FormField>
          </div>

          <FormField label="Last Name" required error={errors.lastName}>
            <input
              type="text"
              value={form.lastName}
              onChange={handleChange('lastName')}
              className={inputClasses}
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

          <FormField label="Address" required error={errors.address}>
            <input
              type="text"
              value={form.address}
              onChange={handleChange('address')}
              className={inputClasses}
            />
          </FormField>
        </section>

        <section className="space-y-2 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Serial Barcode
          </h2>
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
                onClick={() => setScannerOpen(true)}
                className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 px-3.5 text-white shadow-sm hover:opacity-90"
                aria-label="Scan serial barcode"
              >
                <ScanLine size={22} />
              </button>
            </div>
          </FormField>
        </section>

        <section className="space-y-3 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Geotagging
          </h2>
          <p className="text-xs text-gray-400">
            Note: Please upload original camera photos. Screenshots, Messenger images, and
            Facebook images may not contain GPS metadata.
          </p>

          <GeoUploadCard
            label="Start Geotag Image"
            prefix="Start"
            value={geotagging.start}
            onChange={(data) => setGeotagging((prev) => ({ ...prev, start: data }))}
          />
          {errors.startImage && <p className="text-xs text-red-600">{errors.startImage}</p>}

          <GeoUploadCard
            label="End Geotag Image"
            prefix="End"
            value={geotagging.end}
            onChange={(data) => setGeotagging((prev) => ({ ...prev, end: data }))}
          />
          {errors.endImage && <p className="text-xs text-red-600">{errors.endImage}</p>}

          <DistanceResult
            distanceMeters={distance.distanceMeters}
            distanceKilometers={distance.distanceKilometers}
          />
          {errors.distance && <p className="text-xs text-red-600">{errors.distance}</p>}
        </section>

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 py-3 font-semibold text-white shadow-md hover:opacity-90"
        >
          Submit Form
        </button>
      </form>

      {scannerOpen && (
        <BarcodeScannerModal
          onDetected={handleBarcodeDetected}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  )
}
