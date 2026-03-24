import { useEffect, useRef, useState } from 'react'
import { Play, Square, Maximize, Minimize, WifiOff, Loader } from 'lucide-react'

interface Props {
  cameraId: string
  cameraName: string
  resolution?: string
  frameRate?: number
  status?: string
}

const WSStreamPlayer = ({ cameraId, cameraName, resolution, frameRate, status }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [streamStatus, setStreamStatus] = useState<'idle' | 'loading' | 'live' | 'error'>('idle')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState('')
  const [fps, setFps] = useState(0)
  const frameCountRef = useRef(0)
  const lastFpsUpdate = useRef(Date.now())

  const getToken = () => {
    const stored = localStorage.getItem('auth-storage')
    if (!stored) return ''
    try { return JSON.parse(stored)?.state?.token || '' }
    catch { return '' }
  }

  const startStream = () => {
    setStreamStatus('loading')
    setError('')

    const token = getToken()
    const wsUrl = `ws://localhost:5000/ws/stream?token=${token}&cameraId=${cameraId}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      console.log('✅ WebSocket connected')
      setStreamStatus('live')
    }

    ws.onmessage = (event) => {
      const blob = new Blob([event.data], { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)

        // Calculate FPS
        frameCountRef.current++
        const now = Date.now()
        if (now - lastFpsUpdate.current >= 1000) {
          setFps(frameCountRef.current)
          frameCountRef.current = 0
          lastFpsUpdate.current = now
        }
      }
      img.src = url
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
      setError('Connection failed')
      setStreamStatus('error')
    }

    ws.onclose = () => {
      if (streamStatus === 'live') setStreamStatus('idle')
    }
  }

  const stopStream = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setStreamStatus('idle')
    setFps(0)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    return () => { stopStream() }
  }, [cameraId])

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          {streamStatus === 'live' ? (
            <><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-medium">● LIVE</span>
            <span className="text-slate-500 text-xs ml-2">{fps}fps</span></>
          ) : (
            <><WifiOff className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">Offline</span></>
          )}
        </div>
        <span className="text-white text-sm font-medium">{cameraName}</span>
        <div className="flex items-center space-x-2">
          {streamStatus !== 'live' ? (
            <button onClick={startStream} disabled={streamStatus === 'loading'}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50">
              {streamStatus === 'loading' ? <Loader className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              <span>{streamStatus === 'loading' ? 'Connecting...' : 'Start Live'}</span>
            </button>
          ) : (
            <button onClick={stopStream}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
              <Square className="w-3 h-3" />
              <span>Stop</span>
            </button>
          )}
          <button onClick={toggleFullscreen}
            className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded transition-colors">
            {isFullscreen ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        {streamStatus === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <WifiOff className="w-16 h-16 mb-4" />
            <p className="text-sm">Click "Start Live" to begin streaming</p>
          </div>
        )}
        {streamStatus === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-400">
            <Loader className="w-16 h-16 mb-4 animate-spin" />
            <p className="text-sm">Connecting...</p>
          </div>
        )}
        {streamStatus === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
            <WifiOff className="w-16 h-16 mb-4" />
            <p className="text-sm mb-3">{error}</p>
            <button onClick={startStream} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Retry</button>
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full object-contain"
          style={{ display: streamStatus === 'live' ? 'block' : 'none' }} />

        {/* Status badge */}
        {status && (
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded text-sm font-medium text-white ${
              status === 'Active' ? 'bg-green-500' :
              status === 'Inactive' ? 'bg-gray-500' : 'bg-yellow-500'
            }`}>{status}</span>
          </div>
        )}
      </div>

      {/* Info bar */}
      {streamStatus === 'live' && (
        <div className="px-4 py-2 bg-slate-900/50 flex items-center space-x-4 text-xs text-slate-400">
          <span>📹 {resolution || '1280x720'}</span>
          <span>🎬 {fps} FPS</span>
          <span>🔴 WebSocket Stream</span>
        </div>
      )}
    </div>
  )
}

export default WSStreamPlayer
