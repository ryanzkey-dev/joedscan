import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { X, CameraOff, Flashlight, FlashlightOff, ZoomIn } from 'lucide-react'

const SCAN_CONSTRAINTS = {
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    focusMode: 'continuous',
    advanced: [{ focusMode: 'continuous' }],
  },
}

export default function BarcodeScannerModal({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const [error, setError] = useState('')
  const [torchOn, setTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [zoom, setZoom] = useState(null)
  const [zoomRange, setZoomRange] = useState(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let cancelled = false

    reader
      .decodeFromConstraints(SCAN_CONSTRAINTS, videoRef.current, (result) => {
        if (cancelled || !result) return
        onDetected(result.getText())
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop()
          return
        }
        controlsRef.current = controls

        const capabilities = controls.streamVideoCapabilitiesGet?.(() => true)
        if (capabilities?.torch) {
          setTorchSupported(true)
        }
        if (capabilities?.zoom && typeof capabilities.zoom === 'object') {
          setZoomRange(capabilities.zoom)
          setZoom(capabilities.zoom.min)
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
      controlsRef.current?.stop()
    }
  }, [onDetected])

  const toggleTorch = async () => {
    const next = !torchOn
    try {
      await controlsRef.current?.switchTorch?.(next)
      setTorchOn(next)
    } catch {
      setTorchSupported(false)
    }
  }

  const handleZoomChange = (e) => {
    const value = Number(e.target.value)
    setZoom(value)
    controlsRef.current?.streamVideoConstraintsApply?.({ advanced: [{ zoom: value }] })
  }

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

        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-white">
              <CameraOff size={32} />
              <p>{error}</p>
            </div>
          ) : (
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          )}

          {!error && (
            <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-orange-400/80" />
          )}

          {!error && torchSupported && (
            <button
              type="button"
              onClick={toggleTorch}
              className="absolute right-3 top-3 flex items-center justify-center rounded-full bg-black/50 p-2 text-white"
              aria-label="Toggle flashlight"
            >
              {torchOn ? <FlashlightOff size={18} /> : <Flashlight size={18} />}
            </button>
          )}
        </div>

        {!error && zoomRange && (
          <div className="mt-3 flex items-center gap-2">
            <ZoomIn size={16} className="shrink-0 text-gray-500" />
            <input
              type="range"
              min={zoomRange.min}
              max={zoomRange.max}
              step={zoomRange.step || 0.1}
              value={zoom ?? zoomRange.min}
              onChange={handleZoomChange}
              className="w-full accent-orange-500"
            />
          </div>
        )}

        <p className="mt-3 text-center text-sm text-gray-500">
          Align the barcode inside the box and hold steady.
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
