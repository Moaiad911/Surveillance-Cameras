import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, Filter, Search, Clock, Camera, CheckCircle, Shield, RefreshCw, Play, X } from 'lucide-react'
import { format } from 'date-fns'
import api from '../lib/api'

interface Event {
  _id: string
  type: string
  camera: string
  cameraId: string
  createdAt: string
  severity: 'high' | 'medium' | 'low'
  description: string
  acknowledged: boolean
  anomalyScore?: number
  confidence?: number
  recordingPath?: string
  recordingName?: string
  clipStartTime?: number
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [selectedClip, setSelectedClip] = useState<Event | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const fetchEvents = async () => {
    try {
      const res = await api.get('/dashboard/events?limit=50')
      setEvents(res.data)
    } catch (err) {
      console.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedClip && videoRef.current && selectedClip.recordingPath) {
      const video = videoRef.current
      video.pause()
      video.src = selectedClip.recordingPath
      video.load()

      const handleLoadedMetadata = () => {
        if (selectedClip.clipStartTime) {
          video.currentTime = selectedClip.clipStartTime
        }
        video.play().catch(() => {})
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [selectedClip])

  const acknowledgeEvent = async (eventId: string) => {
    try {
      await api.put(`/dashboard/events/${eventId}/acknowledge`)
      setEvents(prev => prev.map(e => e._id === eventId ? { ...e, acknowledged: true } : e))
    } catch (err) {
      console.error('Failed to acknowledge event')
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.camera?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    }
  }

  const getAnomalyBadge = (score?: number) => {
    if (!score) return null
    const pct = (score * 100).toFixed(0)
    if (score > 0.8) return <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/50">⚠ Anomaly {pct}%</span>
    if (score > 0.5) return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">⚠ Suspicious {pct}%</span>
    return <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/50">✓ Normal {pct}%</span>
  }

  const highCount = events.filter(e => e.severity === 'high' && !e.acknowledged).length
  const unacknowledged = events.filter(e => !e.acknowledged).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
          <p className="text-slate-400">Monitor and manage system events and alerts</p>
        </div>
        <button onClick={fetchEvents} className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Events</p>
          <p className="text-2xl font-bold text-white">{events.length}</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
          <p className="text-red-400 text-sm">High Severity</p>
          <p className="text-2xl font-bold text-red-400">{highCount}</p>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
          <p className="text-yellow-400 text-sm">Unacknowledged</p>
          <p className="text-2xl font-bold text-yellow-400">{unacknowledged}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Search events..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading events...</div>
      ) : (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="divide-y divide-slate-700">
            {filteredEvents.map((event) => (
              <div key={event._id}
                className={`p-6 hover:bg-slate-700/50 transition-colors ${!event.acknowledged ? 'bg-slate-700/30' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg border ${getSeverityColor(event.severity)}`}>
                      {event.anomalyScore !== undefined ? <Shield className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                        <h3 className="text-lg font-semibold text-white">{event.type}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                        {!event.acknowledged && <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">New</span>}
                        {getAnomalyBadge(event.anomalyScore)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2 flex-wrap gap-2">
                        <div className="flex items-center space-x-1">
                          <Camera className="w-4 h-4" />
                          <span>{event.camera || 'Unknown Camera'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(event.createdAt), 'MMM dd, yyyy HH:mm:ss')}</span>
                        </div>
                        {event.confidence && (
                          <div className="flex items-center space-x-1">
                            <Shield className="w-4 h-4" />
                            <span>Confidence: {(event.confidence * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm">{event.description}</p>
                      {event.recordingName && (
                        <p className="text-slate-500 text-xs mt-1">📹 {event.recordingName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    {/* View Clip button */}
                    {event.recordingPath && (
                      <button onClick={() => setSelectedClip(event)}
                        className="flex items-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm">
                        <Play className="w-4 h-4" />
                        <span>View Clip</span>
                      </button>
                    )}
                    {!event.acknowledged ? (
                      <button onClick={() => acknowledgeEvent(event._id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <span className="flex items-center space-x-1 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Acknowledged</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No events found</p>
        </div>
      )}

      {/* Video Clip Modal */}
      {selectedClip && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div>
                <h3 className="text-white font-semibold">{selectedClip.type} Detected</h3>
                <p className="text-slate-400 text-sm">
                  {selectedClip.recordingName} • Score: {((selectedClip.anomalyScore || 0) * 100).toFixed(0)}%
                </p>
              </div>
              <button onClick={() => { setSelectedClip(null); if (videoRef.current) videoRef.current.pause() }}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black rounded-b-xl">
              <video ref={videoRef} controls className="w-full rounded-lg max-h-96"
                onError={() => console.error('Video load error')}>
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="px-6 py-3 bg-slate-900/50 rounded-b-xl flex items-center justify-between text-xs text-slate-400">
              <span>Detected at: {format(new Date(selectedClip.createdAt), 'MMM dd, yyyy HH:mm:ss')}</span>
              <span className={`px-2 py-1 rounded font-medium ${getSeverityColor(selectedClip.severity)}`}>
                {selectedClip.severity.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events
