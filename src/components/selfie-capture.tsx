'use client'

import { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, RefreshCw, Check } from 'lucide-react'

interface SelfieCaptureProps {
  onCapture: (blob: Blob) => void
  onSkip?: () => void
}

export function SelfieCapture({ onCapture, onSkip }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraReady(true)
        setError(null)
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('Unable to access camera. Please check permissions.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraReady(false)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(imageData)
      stopCamera()
    }
  }, [stopCamera])

  const retake = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const confirm = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onCapture(blob)
      }
    }, 'image/jpeg', 0.8)
  }, [capturedImage, onCapture])

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">📸 Let's Take a Quick Selfie!</h3>
        <p className="text-muted-foreground">
          This helps me remember our conversation
        </p>
      </div>

      <div className="relative w-full max-w-md mx-auto aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
        {!isCameraReady && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Camera className="h-16 w-16 text-gray-400" />
            {error && (
              <p className="text-sm text-red-600 px-4 text-center">{error}</p>
            )}
            <Button onClick={startCamera} size="lg">
              <Camera className="h-5 w-5 mr-2" />
              Start Camera
            </Button>
            {onSkip && (
              <Button onClick={onSkip} variant="ghost" size="sm">
                Skip for now
              </Button>
            )}
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${
            isCameraReady && !capturedImage ? 'block' : 'hidden'
          }`}
        />

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured selfie"
            className="w-full h-full object-cover"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {isCameraReady && !capturedImage && (
        <div className="flex justify-center gap-2">
          <Button onClick={capturePhoto} size="lg" className="gap-2">
            <Camera className="h-5 w-5" />
            Capture Photo
          </Button>
        </div>
      )}

      {capturedImage && (
        <div className="flex justify-center gap-2">
          <Button onClick={retake} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retake
          </Button>
          <Button onClick={confirm} size="lg" className="gap-2">
            <Check className="h-5 w-5" />
            Looks Great!
          </Button>
        </div>
      )}
    </Card>
  )
}

