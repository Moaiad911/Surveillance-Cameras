import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cameraService } from '../services/cameraService'

const RESOLUTIONS = ['1280x720', '1920x1080', '2560x1440', '3840x2160', '1024x768', '1600x1200', '2048x1536']

const EditCamera = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', model: '', ipAddress: '', streamURL: '',
    location: '', resolution: '1920x1080', frameRate: 30,
    recording: true, status: 'Active' as 'Active' | 'Inactive'
  })

  useEffect(() => {
    const fetchCamera = async () => {
      try {
        const camera = await cameraService.getById(id!)
        setForm({
          name: camera.name, model: camera.model,
          ipAddress: camera.ipAddress, streamURL: camera.streamURL,
          location: camera.location, resolution: camera.resolution,
          frameRate: camera.frameRate, recording: camera.recording,
          status: camera.status
        })
      } catch {
        setError('Failed to load camera')
      } finally {
        setFetching(false)
      }
    }
    fetchCamera()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
               name === 'frameRate' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await cameraService.update(id!, form)
      navigate('/cameras')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update camera')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <p className="text-slate-400 text-center py-12">Loading...</p>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/cameras" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Camera</h1>
          <p className="text-slate-400">Update camera details</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Camera Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Model *</label>
            <input name="model" value={form.model} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">IP Address *</label>
            <input name="ipAddress" value={form.ipAddress} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Stream URL *</label>
            <input name="streamURL" value={form.streamURL} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Location *</label>
            <input name="location" value={form.location} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Resolution *</label>
            <select name="resolution" value={form.resolution} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Frame Rate *</label>
            <input name="frameRate" type="number" min="1" max="120" value={form.frameRate} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input type="checkbox" name="recording" id="recording" checked={form.recording}
            onChange={handleChange} className="w-4 h-4 rounded" />
          <label htmlFor="recording" className="text-sm text-slate-400">Enable Recording</label>
        </div>

        <div className="flex gap-4 pt-4">
          <Link to="/cameras"
            className="flex-1 text-center py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            Cancel
          </Link>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors">
            {loading ? 'Updating...' : 'Update Camera'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditCamera
