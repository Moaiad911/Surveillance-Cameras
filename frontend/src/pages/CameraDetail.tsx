import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Settings, Download, Share2, Play, Pause, Volume2, Maximize } from 'lucide-react'

interface CameraDetails {
  id: string
  name: string
  location: string
  status: 'online' | 'offline' | 'recording'
  resolution: string
  fps: number
  ipAddress: string
  model: string
  lastActivity: Date
  recordingEnabled: boolean
}

const CameraDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [camera, setCamera] = useState<CameraDetails | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCamera({
        id: id || '1',
        name: 'Main Entrance',
        location: 'Building A - Front Door',
        status: 'recording',
        resolution: '1920x1080',
        fps: 30,
        ipAddress: '192.168.1.100',
        model: 'IP Camera Pro 4K',
        lastActivity: new Date(),
        recordingEnabled: true,
      })
    }, 500)
  }, [id])

  if (!camera) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading camera details...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/cameras"
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{camera.name}</h1>
            <p className="text-slate-400">{camera.location}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Feed */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="relative aspect-video bg-slate-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 border-4 border-primary-500 rounded-full mx-auto mb-4 animate-pulse" />
                  <p className="text-slate-400">Live Feed</p>
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded text-sm font-medium text-white ${
                    camera.status === 'recording'
                      ? 'bg-red-500'
                      : camera.status === 'online'
                      ? 'bg-green-500'
                      : 'bg-gray-500'
                  }`}
                >
                  {camera.status === 'recording' ? '● REC' : camera.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Video Controls */}
            <div className="p-4 bg-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>
                <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors">
                  <Volume2 className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                >
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Info */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Camera Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Status</label>
                <p className="text-white font-medium capitalize">{camera.status}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Model</label>
                <p className="text-white font-medium">{camera.model}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">IP Address</label>
                <p className="text-white font-medium">{camera.ipAddress}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Resolution</label>
                <p className="text-white font-medium">{camera.resolution}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Frame Rate</label>
                <p className="text-white font-medium">{camera.fps} FPS</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Recording</label>
                <p className="text-white font-medium">
                  {camera.recordingEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Last Activity</label>
                <p className="text-white font-medium">
                  {camera.lastActivity.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white">
                View Recordings
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white">
                Configure Motion Detection
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white">
                Set Alerts
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white">
                Camera Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraDetail


