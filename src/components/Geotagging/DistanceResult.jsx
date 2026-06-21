import { Ruler } from 'lucide-react'

export default function DistanceResult({ distanceMeters, distanceKilometers }) {
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <Ruler size={16} />
        Geotagging Distance Result
      </p>
      {distanceMeters ? (
        <div className="text-sm text-orange-800">
          <p className="font-semibold">Distance: {distanceMeters} meters</p>
          <p>Equivalent: {distanceKilometers} km</p>
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          Upload both Start and End geotag images to compute distance.
        </p>
      )}
    </div>
  )
}
