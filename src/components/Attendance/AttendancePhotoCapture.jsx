import { useEffect, useRef, useState } from 'react'
import { Camera, Upload, RotateCcw } from 'lucide-react'

export default function AttendancePhotoCapture({ label, overlayLines, disabled, onCaptured }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraOpen])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
  }

  useEffect(() => stopCamera, [])

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      setCameraOpen(true)
    } catch {
      setError('Camera access is not available. Please check your browser permission.')
    }
  }

  const stampAndCapture = (drawSource) => {
    const canvas = canvasRef.current
    drawSource(canvas)

    const ctx = canvas.getContext('2d')
    ctx.font = 'bold 20px sans-serif'
    ctx.textBaseline = 'top'
    const padding = 12
    const lineHeight = 26
    const boxHeight = overlayLines.length * lineHeight + padding * 2

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(0, canvas.height - boxHeight, canvas.width, boxHeight)
    ctx.fillStyle = '#ffffff'
    overlayLines.forEach((line, i) => {
      ctx.fillText(line, padding, canvas.height - boxHeight + padding + i * lineHeight)
    })

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setPreview(dataUrl)
    onCaptured(dataUrl, `${label.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`)
  }

  const handleCapture = () => {
    stampAndCapture((canvas) => {
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    })
    stopCamera()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        stampAndCapture((canvas) => {
          canvas.width = img.width
          canvas.height = img.height
          canvas.getContext('2d').drawImage(img, 0, 0)
        })
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const handleRetake = () => {
    setPreview(null)
    onCaptured('', '')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {preview ? (
        <div className="space-y-2">
          <img src={preview} alt={label} className="w-full rounded-xl border border-gray-200" />
          <button
            type="button"
            onClick={handleRetake}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={14} />
            Retake
          </button>
        </div>
      ) : cameraOpen ? (
        <div className="space-y-2">
          <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl bg-black" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCapture}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 py-2 text-sm font-semibold text-white"
            >
              Capture
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Camera size={16} />
            Take Photo
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={16} />
            Upload Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {disabled && !preview && (
        <p className="text-xs text-gray-400">Complete the fields above first.</p>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
