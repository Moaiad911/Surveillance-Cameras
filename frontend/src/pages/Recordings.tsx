import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Upload, Video, AlertCircle, Search, Calendar, Filter, X, HardDrive, Clock, FolderOpen } from 'lucide-react'
import { recordingService, Recording } from '../services/recordingService'
import { cameraService } from '../services/cameraService'
import type { Camera } from '../services/cameraService'
import { useAuthStore } from '../store/authStore'
import VideoPlayerModal from '../components/VideoPlayerModal'
import RecordingCard from '../components/RecordingCard'

type SortOption = 'newest' | 'oldest' | 'largest' | 'smallest'

const Recordings = () => {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'Admin'
  const [searchParams] = useSearchParams()

  const [cameras, setCameras] = useState<Camera[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  useEffect(() => { loadCameras() }, [])

  useEffect(() => {
    const cameraParam = searchParams.get('camera')
    if (cameraParam && cameras.length > 0) {
      const exists = cameras.find(c => c._id === cameraParam)
      if (exists) setSelectedCamera(cameraParam)
    }
  }, [cameras, searchParams])

  useEffect(() => {
    if (selectedCamera) loadRecordings(selectedCamera)
  }, [selectedCamera])

  const loadCameras = async () => {
    try {
      const data = await cameraService.getAll()
      setCameras(data)
      if (data.length > 0) setSelectedCamera(data[0]._id)
    } catch {
      setError('Failed to load cameras')
    }
  }

  const loadRecordings = async (cameraId: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await recordingService.getByCamera(cameraId)
      setRecordings(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load recordings')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedCamera) return
    setUploading(true)
    setUploadProgress(0)
    setError('')
    try {
      await recordingService.upload(selectedCamera, file, setUploadProgress)
      setFile(null)
      setSuccess('Recording uploaded successfully!')
      await loadRecordings(selectedCamera)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload recording')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (recording: Recording) => {
    if (!confirm(`Delete "${recording.originalName}"?`)) return
    try {
      await recordingService.delete(recording._id)
      setRecordings(recordings.filter(r => r._id !== recording._id))
      setSuccess('Recording deleted!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete recording')
    }
  }

  const handleDownload = (recording: Recording) => {
    recordingService.download(recording)
  }

  const handlePlay = (recording: Recording) => {
    setSelectedRecording(recording)
    setIsPlayerOpen(true)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
    setSortBy('newest')
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  const filteredRecordings = useMemo(() => {
    let result = [...recordings]
    if (searchQuery) result = result.filter(r => r.originalName.toLowerCase().includes(searchQuery.toLowerCase()))
    if (dateFrom) result = result.filter(r => new Date(r.createdAt) >= new Date(dateFrom))
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999)
      result = result.filter(r => new Date(r.createdAt) <= to)
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'largest': return b.size - a.size
        case 'smallest': return a.size - b.size
        default: return 0
      }
    })
    return result
  }, [recordings, searchQuery, dateFrom, dateTo, sortBy])

  const stats = useMemo(() => ({
    count: recordings.length,
    size: formatSize(recordings.reduce((acc, r) => acc + r.size, 0))
  }), [recordings])

  const hasActiveFilters = searchQuery || dateFrom || dateTo || sortBy !== 'newest'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Recordings</h1>
        <p className="text-slate-400">Manage and view camera recordings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-lg"><Video className="w-6 h-6 text-blue-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Total Recordings</p>
            <p className="text-2xl font-bold text-white">{stats.count}</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-3">
          <div className="p-3 bg-green-500/20 rounded-lg"><HardDrive className="w-6 h-6 text-green-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Total Size</p>
            <p className="text-2xl font-bold text-white">{stats.size}</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-lg"><Clock className="w-6 h-6 text-purple-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Camera</p>
            <p className="text-lg font-bold text-white truncate">
              {cameras.find(c => c._id === selectedCamera)?.name || 'Select camera'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}><X className="w-5 h-5" /></button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
          <Video className="w-5 h-5" />{success}
        </div>
      )}

      {/* Controls */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Camera</label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a camera</option>
              {cameras.map((camera) => (
                <option key={camera._id} value={camera._id}>{camera.name} - {camera.location}</option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Upload Recording</label>
              {uploading ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className="text-sm text-slate-400 min-w-[45px]">{uploadProgress}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Uploading...</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="video/mp4,video/avi,video/mkv,video/mov"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  <button
                    onClick={handleUpload}
                    disabled={!file || !selectedCamera}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4" />Upload
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Supported: MP4, AVI, MKV, MOV</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />Filters & Search
          </h2>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <X className="w-4 h-4" />Clear filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search recordings..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 [color-scheme:dark]" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 [color-scheme:dark]" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="largest">Largest First</option>
            <option value="smallest">Smallest First</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-slate-400">
        Showing {filteredRecordings.length} of {recordings.length} recordings
        {selectedCamera && cameras.find(c => c._id === selectedCamera) && (
          <> for <span className="text-blue-400">{cameras.find(c => c._id === selectedCamera)?.name}</span></>
        )}
      </p>

      {/* Recordings */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading recordings...</p>
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="p-12 text-center bg-slate-800/50 rounded-xl border border-slate-700/50">
            <FolderOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              {hasActiveFilters ? 'No recordings match your filters' : 'No recordings found for this camera'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-blue-400 hover:text-blue-300 mt-2 text-sm">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredRecordings.map((recording) => (
              <RecordingCard
                key={recording._id}
                recording={recording}
                isAdmin={isAdmin}
                onPlay={handlePlay}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <VideoPlayerModal
        recording={selectedRecording}
        isOpen={isPlayerOpen}
        onClose={() => { setIsPlayerOpen(false); setSelectedRecording(null) }}
      />
    </div>
  )
}

export default Recordings
