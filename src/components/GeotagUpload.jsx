import { useEffect, useState } from 'react'
import { gps as parseGps } from 'exifr'
import Tesseract from 'tesseract.js'
import { MapPin, Loader2 } from 'lucide-react'
import { parseCoordinatesFromText } from '../utils/parseCoordinatesFromText'

export default function GeotagUpload({ label, prefix, value, onChange }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [status, setStatus] = useState('')
  const [isReading, setIsReading] = useState(false)

  useEffect(() => {
    if (!value.image) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(value.image)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [value.image])

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('')
    setIsReading(true)
    const timestamp = new Date().toLocaleString()

    try {
      const gpsData = await parseGps(file)
      if (gpsData?.latitude && gpsData?.longitude) {
        onChange({
          image: file,
          latitude: gpsData.latitude.toFixed(6),
          longitude: gpsData.longitude.toFixed(6),
          timestamp,
        })
        setIsReading(false)
        return
      }
    } catch {
      // fall through to OCR
    }

    setStatus('No EXIF GPS found, reading coordinates from image text...')
    try {
      const { data } = await Tesseract.recognize(file, 'eng')
      const coords = parseCoordinatesFromText(data.text)
      if (coords) {
        onChange({
          image: file,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
          timestamp,
        })
        setStatus('Coordinates detected from image text overlay.')
      } else {
        setStatus('No GPS data found in this image.')
        onChange({ image: file, latitude: '', longitude: '', timestamp })
      }
    } catch {
      setStatus('Unable to read coordinates from this image.')
      onChange({ image: file, latitude: '', longitude: '', timestamp })
    } finally {
      setIsReading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>

      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-orange-700 hover:file:bg-orange-100"
      />

      {previewUrl && (
        <img
          src={previewUrl}
          alt={`${label} preview`}
          className="mt-3 h-40 w-full rounded-lg object-cover"
        />
      )}

      {isReading && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Loader2 size={12} className="animate-spin" />
          Reading location from image...
        </p>
      )}

      {!isReading && status && <p className="mt-2 text-xs text-amber-600">{status}</p>}

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
            <dt>Upload Date and Time</dt>
            <dd className="font-medium text-gray-800">{value.timestamp}</dd>
          </div>
        </dl>
      )}
    </div>
  )
}
