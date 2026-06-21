import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import {
  X,
  CameraOff,
  Flashlight,
  FlashlightOff,
  ZoomIn,
  RotateCcw,
  Lightbulb,
} from 'lucide-react'

const SCAN_CONSTRAINTS = {
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    focusMode: 'continuous',
    advanced: [{ focusMode: 'continuous' }],
  },
}

const NOT_DETECTED_TIMEOUT_MS = 12000

const TIPS = [
  'Clean your camera lens',
  'Use good lighting',
  'Avoid shaking the phone',
  'Keep barcode flat',
  'Do not scan too close',
  'Move phone slowly until barcode becomes clear',
]

export default function BarcodeScannerModal({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const timeoutRef = useRef(null)
  const [error, setError] = useState('')
  const [notDetected, setNotDetected] = useState(false)
  const [manualValue, setManualValue] = useState('')
  const [torchOn, setTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [zoom, setZoom] = useState(null)
  const [zoomRange, setZoomRange] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let cancelled = false

    timeoutRef.current = setTimeout(() => {
      if (!cancelled) setNotDetected(true)
    }, NOT_DETECTED_TIMEOUT_MS)

    reader
      .decodeFromConstraints(SCAN_CONSTRAINTS, videoRef.current, (result) => {
        if (cancelled || !result) return
        clearTimeout(timeoutRef.current)
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
      .catch(() => {
        if (!cancelled) {
          setError('Camera access is not available. Please check your browser permission.')
        }
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutRef.current)
      controlsRef.current?.stop()
    }
  }, [onDetected, attempt])

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

  const handleRetry = () => {
    setError('')
    setNotDetected(false)
    setAttempt((a) => a + 1)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualValue.trim()) return
    onDetected(manualValue.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
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

        {notDetected && !error && (
          <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-center text-sm text-amber-700">
            Barcode not detected. You can retry or enter the serial number manually.
          </div>
        )}

        {(error || notDetected) && (
          <button
            type="button"
            onClick={handleRetry}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-300 py-2.5 font-medium text-orange-700 hover:bg-orange-50"
          >
            <RotateCcw size={16} />
            Retry Scanning
          </button>
        )}

        <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
          <input
            type="text"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder="Or enter serial number manually"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 px-3.5 py-2 text-sm font-semibold text-white"
          >
            Use
          </button>
        </form>

        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Lightbulb size={14} />
            Tips for a better scan
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-gray-500">
            {TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  )
}
