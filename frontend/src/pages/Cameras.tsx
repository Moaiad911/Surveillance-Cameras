import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Plus, Search, Filter, Trash2 } from 'lucide-react'
import { cameraService } from '../services/cameraService'
import type { Camera as CameraType } from '../services/cameraService'
import { useAuthStore } from '../store/authStore'

const Cameras = () => {
  const [cameras, setCameras] = useState<CameraType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'Active' | 'Inactive'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'Admin'

  useEffect(() => {
    fetchCameras()
  }, [])

  const fetchCameras = async () => {
    try {
      setLoading(true)
      const data = await cameraService.getAll()
      setCameras(data)
    } catch (err: any) {
      setError('Failed to load cameras')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('Are you sure you want to delete this camera?')) return
    try {
      await cameraService.delete(id)
      setCameras(cameras.filter(c => c._id !== id))
    } catch (err) {
      alert('Failed to delete camera')
    }
  }

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || camera.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cameras</h1>
          <p className="text-slate-400">Manage and monitor all surveillance cameras</p>
        </div>
        {isAdmin && (
          <Link
            to="/cameras/new"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Camera</span>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search cameras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-slate-400 text-center py-12">Loading cameras...</p>}
      {error && <p className="text-red-400 text-center py-12">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCameras.map((camera) => (
          <Link
            key={camera._id}
            to={`/cameras/${camera._id}`}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-slate-700 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{camera.name}</h3>
                  <p className="text-sm text-slate-400">{camera.location}</p>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={(e) => handleDelete(camera._id, e)}
                  className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              )}
            </div>

            <div className="relative w-full h-48 bg-slate-900 rounded-lg mb-4 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Camera Preview</p>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${camera.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {camera.status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Model</span>
                <span className="text-white">{camera.model}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Resolution</span>
                <span className="text-white">{camera.resolution}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Frame Rate</span>
                <span className="text-white">{camera.frameRate} fps</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">IP Address</span>
                <span className="text-white">{camera.ipAddress}</span>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-4">
                <Link
                  to={`/cameras/${camera._id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="block text-center py-2 bg-slate-700 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                >
                  Edit
                </Link>
              </div>
            )}
          </Link>
        ))}
      </div>

      {!loading && filteredCameras.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No cameras found</p>
          {isAdmin && (
            <Link to="/cameras/new" className="mt-4 inline-block text-blue-400 hover:underline">
              Add your first camera
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default Cameras
