import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Plus, Search, Filter, MoreVertical } from 'lucide-react'

interface CameraItem {
  id: string
  name: string
  location: string
  status: 'online' | 'offline' | 'recording'
  lastActivity: Date
  resolution: string
  fps: number
}

const Cameras = () => {
  const [cameras, setCameras] = useState<CameraItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'recording'>('all')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCameras([
        {
          id: '1',
          name: 'Main Entrance',
          location: 'Building A - Front Door',
          status: 'recording',
          lastActivity: new Date(),
          resolution: '1920x1080',
          fps: 30,
        },
        {
          id: '2',
          name: 'Parking Lot',
          location: 'Building A - Parking Area',
          status: 'online',
          lastActivity: new Date(Date.now() - 3600000),
          resolution: '1920x1080',
          fps: 25,
        },
        {
          id: '3',
          name: 'Back Entrance',
          location: 'Building A - Rear Door',
          status: 'online',
          lastActivity: new Date(Date.now() - 1800000),
          resolution: '1280x720',
          fps: 30,
        },
        {
          id: '4',
          name: 'Lobby',
          location: 'Building A - Main Lobby',
          status: 'recording',
          lastActivity: new Date(),
          resolution: '1920x1080',
          fps: 30,
        },
        {
          id: '5',
          name: 'Server Room',
          location: 'Building B - Floor 2',
          status: 'offline',
          lastActivity: new Date(Date.now() - 86400000),
          resolution: '1920x1080',
          fps: 30,
        },
        {
          id: '6',
          name: 'Warehouse',
          location: 'Building C - Storage',
          status: 'online',
          lastActivity: new Date(Date.now() - 7200000),
          resolution: '1280x720',
          fps: 20,
        },
      ])
    }, 500)
  }, [])

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || camera.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'recording':
        return 'bg-blue-500'
      case 'offline':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'recording':
        return 'Recording'
      case 'offline':
        return 'Offline'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cameras</h1>
          <p className="text-slate-400">Manage and monitor all surveillance cameras</p>
        </div>
        <Link
          to="/cameras/new"
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Camera</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search cameras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="recording">Recording</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCameras.map((camera) => (
          <Link
            key={camera.id}
            to={`/cameras/${camera.id}`}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-primary-500 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-slate-700 rounded-lg group-hover:bg-primary-600 transition-colors">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{camera.name}</h3>
                  <p className="text-sm text-slate-400">{camera.location}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Camera Preview Placeholder */}
            <div className="relative w-full h-48 bg-slate-900 rounded-lg mb-4 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Camera Preview</p>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(
                    camera.status
                  )}`}
                >
                  {getStatusText(camera.status)}
                </span>
              </div>
            </div>

            {/* Camera Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Resolution</span>
                <span className="text-white">{camera.resolution}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">FPS</span>
                <span className="text-white">{camera.fps}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Last Activity</span>
                <span className="text-white">
                  {new Date(camera.lastActivity).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCameras.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No cameras found</p>
        </div>
      )}
    </div>
  )
}

export default Cameras


