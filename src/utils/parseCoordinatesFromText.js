const COORD_PATTERN = /(\d{1,3}\.\d+)\s*°?\s*([NS])[,\s]+(\d{1,3}\.\d+)\s*°?\s*([EW])/i

export function parseCoordinatesFromText(text) {
  const match = text.match(COORD_PATTERN)
  if (!match) return null

  const [, latStr, latDir, lonStr, lonDir] = match
  let latitude = parseFloat(latStr)
  let longitude = parseFloat(lonStr)

  if (latDir.toUpperCase() === 'S') latitude = -latitude
  if (lonDir.toUpperCase() === 'W') longitude = -longitude

  return { latitude, longitude }
}
