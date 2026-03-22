import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, Play, Square, Maximize, Minimize, Edit } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

interface Camera {
  _id: string
  name: string
  location: string
  status: string
  resolution: string
  frameRate: number
  ipAddress: string
  model: string
  streamURL: string
  recording: boolean
  createdAt: string
}

const CameraDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'Admin'
  const [camera, setCamera] = useState<Camera | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCamera = async () => {
      try {
        const res = await api.get(`/cameras/${id}`)
        setCamera(res.data)
      } catch (err) {
        console.error('Failed to load camera')
      } finally {
        setLoading(false)
      }
    }
    fetchCamera()
  }, [id])

  const getToken = () => {
    const stored = localStorage.getItem('auth-storage')
    if (!stored) return ''
    try { return JSON.parse(stored)?.state?.token || '' }
    catch { return '' }
  }

  const startStream = () => {
    if (!camera) return
    const token = getToken()
    const streamUrl = `http://localhost:5000/api/mjpeg/${camera._id}?token=${token}`
    if (imgRef.current) {
      imgRef.current.src = streamUrl
      setIsStreaming(true)
    }
  }

  const stopStream = () => {
    if (imgRef.current) {
      imgRef.current.src = ''
      setIsStreaming(false)
    }
    if (camera) api.delete(`/api/mjpeg/${camera._id}`).catch(() => {})
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

  useEffect(() => { return () => { stopStream() } }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>
  if (!camera) return <div className="text-red-400 text-center py-12">Camera not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{camera.name}</h1>
            <p className="text-slate-400">{camera.location}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button onClick={() => navigate(`/cameras/${id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                {isStreaming ? (
                  <><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 text-sm font-medium">● LIVE</span></>
                ) : (
                  <span className="text-slate-400 text-sm">Offline</span>
                )}
              </div>
              <span className="text-slate-400 text-xs">{camera.resolution} • {camera.frameRate}fps</span>
            </div>

            <div ref={containerRef} className="relative bg-black" style={{ aspectRatio: '16/9' }}>
              {!isStreaming && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <p className="text-lg mb-2">Camera Offline</p>
                  <p className="text-sm">Click "Start Live" to begin streaming</p>
                </div>
              )}
              <img ref={imgRef} className="w-full h-full object-contain"
                style={{ display: isStreaming ? 'block' : 'none' }}
                onError={() => setIsStreaming(false)} alt="Live Stream" />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded text-sm font-medium text-white ${
                  camera.status === 'Active' ? 'bg-green-500' :
                  camera.status === 'Inactive' ? 'bg-gray-500' : 'bg-yellow-500'
                }`}>{camera.status}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {!isStreaming ? (
                  <button onClick={startStream}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <Play className="w-4 h-4" />
                    <span>Start Live</span>
                  </button>
                ) : (
                  <button onClick={stopStream}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    <Square className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                )}
              </div>
              <button onClick={toggleFullscreen}
                className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Camera Information</h2>
            <div className="space-y-4">
              <div><label className="text-sm text-slate-400">Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${camera.status === 'Active' ? 'bg-green-400' : camera.status === 'Inactive' ? 'bg-gray-400' : 'bg-yellow-400'}`} />
                  <p className="text-white font-medium">{camera.status}</p>
                </div>
              </div>
              <div><label className="text-sm text-slate-400">Model</label><p className="text-white font-medium">{camera.model}</p></div>
              <div><label className="text-sm text-slate-400">IP Address</label><p className="text-white font-medium">{camera.ipAddress}</p></div>
              <div><label className="text-sm text-slate-400">Stream URL</label><p className="text-white font-medium text-xs break-all">{camera.streamURL}</p></div>
              <div><label className="text-sm text-slate-400">Resolution</label><p className="text-white font-medium">{camera.resolution}</p></div>
              <div><label className="text-sm text-slate-400">Frame Rate</label><p className="text-white font-medium">{camera.frameRate} FPS</p></div>
              <div><label className="text-sm text-slate-400">Recording</label><p className="text-white font-medium">{camera.recording ? 'Enabled' : 'Disabled'}</p></div>
              <div><label className="text-sm text-slate-400">Added</label><p className="text-white font-medium">{new Date(camera.createdAt).toLocaleDateString()}</p></div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button onClick={() => navigate(`/recordings?camera=${camera._id}`)}
                className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white">
                View Recordings
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white">
                Configure Motion Detection
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white">
                Set Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraDetail
