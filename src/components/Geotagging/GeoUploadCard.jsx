import { useState } from 'react'
import { MapPin, Upload, CheckCircle2 } from 'lucide-react'
import { readGeotag } from '../../utils/exifReader'

export default function GeoUploadCard({ label, prefix, value, onChange }) {
  const [status, setStatus] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('reading')

    const dataUrlPromise = new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })

    const [dataUrl, geo] = await Promise.all([dataUrlPromise, readGeotag(file)])

    onChange({
      imagePreview: dataUrl,
      latitude: geo.latitude,
      longitude: geo.longitude,
      timestamp: geo.timestamp,
    })
    setStatus(geo.found ? 'found' : 'missing')
  }

  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-3 py-4 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600">
        <Upload size={18} />
        Upload {prefix} Image
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </label>

      {value.imagePreview && (
        <img
          src={value.imagePreview}
          alt={`${label} preview`}
          className="mt-3 h-40 w-full rounded-lg object-cover"
        />
      )}

      {status === 'found' && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-600">
          <CheckCircle2 size={14} />
          GPS geotag detected
        </p>
      )}

      {status === 'missing' && (
        <p className="mt-2 text-xs text-amber-600">
          No GPS geotag found. Please upload an original geotagged photo.
        </p>
      )}

      {value.latitude && value.longitude && (
        <dl className="mt-3 space-y-1 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1">
              <MapPin size={12} /> {prefix} Latitude
            </dt>
            <dd className="font-medium text-gray-800">{value.latitude}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1">
              <MapPin size={12} /> {prefix} Longitude
            </dt>
            <dd className="font-medium text-gray-800">{value.longitude}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Upload Timestamp</dt>
            <dd className="font-medium text-gray-800">{value.timestamp}</dd>
          </div>
        </dl>
      )}
    </div>
  )
}
