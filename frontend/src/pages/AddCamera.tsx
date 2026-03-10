import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cameraService } from '../services/cameraService'

const CAMERA_MODELS = [
  'Hikvision DS-2CD2143G2',
  'Hikvision DS-2CD2347G2',
  'Dahua IPC-HDW2831T',
  'Dahua IPC-HFW2849S',
  'Axis P3245-V',
  'Axis M3106-L',
  'Bosch FLEXIDOME 5100i',
  'Hanwha QNV-8080R',
  'Vivotek FD9387-HTV',
  'Other',
]

const LOCATIONS = [
  'Building A - Front Door',
  'Building A - Back Door',
  'Building B - Entrance',
  'Parking Lot - North',
  'Parking Lot - South',
  'Lobby',
  'Server Room',
  'Warehouse',
  'Rooftop',
  'Corridor - Floor 1',
  'Corridor - Floor 2',
  'Other',
]

const FRAME_RATES = ['15', '24', '25', '30', '60']

const AddCamera = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    model: '',
    ipAddress: '',
    streamUrl: '',
    location: '',
    resolution: '1920x1080',
    frameRate: '30',
    status: 'Active',
    recordingEnabled: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateIP = (ip: string) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(ip)) return false
    return ip.split('.').every(part => parseInt(part) >= 0 && parseInt(part) <= 255)
  }

  const validateStreamUrl = (url: string) => {
    return /^rtsp:\/\/.+/.test(url) || /^http(s)?:\/\/.+/.test(url)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Camera name is required'
    if (!form.model) newErrors.model = 'Model is required'
    if (!form.ipAddress.trim()) newErrors.ipAddress = 'IP Address is required'
    else if (!validateIP(form.ipAddress)) newErrors.ipAddress = 'Invalid IP address format (e.g. 192.168.1.100)'
    if (!form.streamUrl.trim()) newErrors.streamUrl = 'Stream URL is required'
    else if (!validateStreamUrl(form.streamUrl)) newErrors.streamUrl = 'URL must start with rtsp:// or http(s)://'
    if (!form.location) newErrors.location = 'Location is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      await cameraService.create(form)
      navigate('/cameras')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create camera')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-500' : 'border-slate-600'
    }`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Add Camera</h1>
          <p className="text-slate-400">Register a new surveillance camera</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Camera Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className={inputClass('name')} placeholder="e.g. Cam1" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Model *</label>
            <select value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
              className={inputClass('model')}>
              <option value="">Select a model</option>
              {CAMERA_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {errors.model && <p className="text-red-400 text-xs mt-1">{errors.model}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">IP Address *</label>
            <input value={form.ipAddress} onChange={e => setForm(p => ({ ...p, ipAddress: e.target.value }))}
              className={inputClass('ipAddress')} placeholder="e.g. 192.168.1.100" />
            {errors.ipAddress && <p className="text-red-400 text-xs mt-1">{errors.ipAddress}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Stream URL *</label>
            <input value={form.streamUrl} onChange={e => setForm(p => ({ ...p, streamUrl: e.target.value }))}
              className={inputClass('streamUrl')} placeholder="e.g. rtsp://192.168.1.100/stream" />
            {errors.streamUrl && <p className="text-red-400 text-xs mt-1">{errors.streamUrl}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Location *</label>
            <select value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              className={inputClass('location')}>
              <option value="">Select a location</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Resolution *</label>
            <select value={form.resolution} onChange={e => setForm(p => ({ ...p, resolution: e.target.value }))}
              className={inputClass('resolution')}>
              <option value="1920x1080">1920x1080 (Full HD)</option>
              <option value="1280x720">1280x720 (HD)</option>
              <option value="3840x2160">3840x2160 (4K)</option>
              <option value="640x480">640x480 (SD)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Frame Rate *</label>
            <select value={form.frameRate} onChange={e => setForm(p => ({ ...p, frameRate: e.target.value }))}
              className={inputClass('frameRate')}>
              {FRAME_RATES.map(f => <option key={f} value={f}>{f} FPS</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className={inputClass('status')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <input type="checkbox" id="recording" checked={form.recordingEnabled}
            onChange={e => setForm(p => ({ ...p, recordingEnabled: e.target.checked }))}
            className="w-4 h-4 text-blue-600 rounded" />
          <label htmlFor="recording" className="text-sm text-slate-400">Enable Recording</label>
        </div>
      </div>

      <div className="flex space-x-3">
        <button onClick={() => navigate(-1)}
          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Camera'}
        </button>
      </div>
    </div>
  )
}

export default AddCamera
