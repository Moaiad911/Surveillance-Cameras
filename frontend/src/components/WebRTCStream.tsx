import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { Device } from 'mediasoup-client'
import { Play, Square, Wifi, WifiOff, Loader } from 'lucide-react'

interface Props {
  cameraId: string
  cameraName: string
}

const WebRTCStream = ({ cameraId, cameraName }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const deviceRef = useRef<Device | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'live' | 'error'>('idle')
  const [error, setError] = useState('')

  const getToken = () => {
    const stored = localStorage.getItem('auth-storage')
    if (!stored) return ''
    try { return JSON.parse(stored)?.state?.token || '' }
    catch { return '' }
  }

  const startStream = async () => {
    setStatus('loading')
    setError('')

    try {
      const token = getToken()
      const socket = io('http://localhost:5000', {
        auth: { token }
      })
      socketRef.current = socket

      socket.on('connect_error', (err) => {
        setError(err.message)
        setStatus('error')
      })

      socket.on('connect', async () => {
        // 1. Get Router RTP Capabilities
        socket.emit('getRouterRtpCapabilities', async (rtpCapabilities: any) => {
          try {
            // 2. Create Device
            const device = new Device()
            await device.load({ routerRtpCapabilities: rtpCapabilities })
            deviceRef.current = device

            // 3. Start FFmpeg stream on server
            socket.emit('startStream', { cameraId }, async (res: any) => {
              if (res.error) { setError(res.error); setStatus('error'); return }

              // 4. Create Transport
              socket.emit('createTransport', { cameraId }, async (transportParams: any) => {
                if (transportParams.error) { setError(transportParams.error); setStatus('error'); return }

                const transport = device.createRecvTransport(transportParams)

                transport.on('connect', ({ dtlsParameters }, callback) => {
                  socket.emit('connectTransport', { dtlsParameters }, callback)
                })

                // 5. Consume stream
                socket.emit('consume', {
                  cameraId,
                  rtpCapabilities: device.rtpCapabilities
                }, async (consumerParams: any) => {
                  if (consumerParams.error) { setError(consumerParams.error); setStatus('error'); return }

                  const consumer = await transport.consume(consumerParams)
                  const stream = new MediaStream([consumer.track])

                  if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                    setStatus('live')
                  }
                })
              })
            })
          } catch (err: any) {
            setError(err.message)
            setStatus('error')
          }
        })
      })
    } catch (err: any) {
      setError(err.message)
      setStatus('error')
    }
  }

  const stopStream = () => {
    if (socketRef.current) {
      socketRef.current.emit('stopStream', { cameraId })
      socketRef.current.disconnect()
      socketRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStatus('idle')
  }

  useEffect(() => {
    return () => { stopStream() }
  }, [cameraId])

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          {status === 'live' ? (
            <><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-medium">● LIVE</span></>
          ) : (
            <><WifiOff className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">Offline</span></>
          )}
        </div>
        <span className="text-white text-sm font-medium">{cameraName}</span>
        <div>
          {status !== 'live' ? (
            <button onClick={startStream} disabled={status === 'loading'}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50">
              {status === 'loading' ? <Loader className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              <span>{status === 'loading' ? 'Connecting...' : 'Start Live'}</span>
            </button>
          ) : (
            <button onClick={stopStream}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
              <Square className="w-3 h-3" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Video */}
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <WifiOff className="w-16 h-16 mb-4" />
            <p className="text-sm">Click "Start Live" to begin streaming</p>
          </div>
        )}
        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-400">
            <Loader className="w-16 h-16 mb-4 animate-spin" />
            <p className="text-sm">Connecting via WebRTC...</p>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
            <WifiOff className="w-16 h-16 mb-4" />
            <p className="text-sm mb-3">{error}</p>
            <button onClick={startStream} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
              Retry
            </button>
          </div>
        )}
        <video ref={videoRef} className="w-full h-full object-contain"
          style={{ display: status === 'live' ? 'block' : 'none' }}
          muted playsInline autoPlay />
      </div>
    </div>
  )
}

export default WebRTCStream
