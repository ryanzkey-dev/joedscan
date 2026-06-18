import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { X, CameraOff } from 'lucide-react'

export default function BarcodeScannerModal({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let cancelled = false
    let controls

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (cancelled || !result) return
        onDetected(result.getText())
      })
      .then((c) => {
        if (cancelled) {
          c.stop()
        } else {
          controls = c
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access to scan.'
              : 'Unable to access camera on this device.'
          )
        }
      })

    return () => {
      cancelled = true
      controls?.stop()
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Scan Serial Barcode</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close scanner"
          >
            <X size={22} />
          </button>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-white">
              <CameraOff size={32} />
              <p>{error}</p>
            </div>
          ) : (
            <video ref={videoRef} className="h-full w-full object-cover" muted />
          )}
          {!error && (
            <div className="pointer-events-none absolute inset-x-6 inset-y-[35%] rounded-lg border-2 border-orange-400/80" />
          )}
        </div>

        <p className="mt-3 text-center text-sm text-gray-500">
          Point the camera at the serial barcode
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
