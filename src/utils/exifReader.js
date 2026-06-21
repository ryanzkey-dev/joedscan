import { gps } from 'exifr'

export async function readGeotag(file) {
  try {
    const coords = await gps(file)
    if (coords?.latitude && coords?.longitude) {
      return {
        latitude: coords.latitude.toFixed(6),
        longitude: coords.longitude.toFixed(6),
        timestamp: new Date().toLocaleString(),
        found: true,
      }
    }
  } catch {
    // fall through to "not found"
  }
  return { latitude: '', longitude: '', timestamp: new Date().toLocaleString(), found: false }
}
