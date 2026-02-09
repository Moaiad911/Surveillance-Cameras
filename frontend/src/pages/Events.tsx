import { useState, useEffect } from 'react'
import { AlertTriangle, Filter, Search, Clock, Camera } from 'lucide-react'
import { format } from 'date-fns'

interface Event {
  id: string
  type: string
  camera: string
  cameraId: string
  timestamp: Date
  severity: 'high' | 'medium' | 'low'
  description: string
  acknowledged: boolean
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvents([
        {
          id: '1',
          type: 'Motion Detected',
          camera: 'Main Entrance',
          cameraId: '1',
          timestamp: new Date(),
          severity: 'high',
          description: 'Motion detected in the main entrance area',
          acknowledged: false,
        },
        {
          id: '2',
          type: 'Object Detected',
          camera: 'Parking Lot',
          cameraId: '2',
          timestamp: new Date(Date.now() - 3600000),
          severity: 'medium',
          description: 'Unknown object detected in parking area',
          acknowledged: false,
        },
        {
          id: '3',
          type: 'Motion Detected',
          camera: 'Back Entrance',
          cameraId: '3',
          timestamp: new Date(Date.now() - 7200000),
          severity: 'high',
          description: 'Motion detected near back entrance',
          acknowledged: true,
        },
        {
          id: '4',
          type: 'System Alert',
          camera: 'Server Room',
          cameraId: '5',
          timestamp: new Date(Date.now() - 10800000),
          severity: 'low',
          description: 'Camera offline - Server Room',
          acknowledged: false,
        },
        {
          id: '5',
          type: 'Motion Detected',
          camera: 'Lobby',
          cameraId: '4',
          timestamp: new Date(Date.now() - 14400000),
          severity: 'high',
          description: 'Motion detected in lobby area',
          acknowledged: true,
        },
        {
          id: '6',
          type: 'Tampering Alert',
          camera: 'Warehouse',
          cameraId: '6',
          timestamp: new Date(Date.now() - 18000000),
          severity: 'high',
          description: 'Possible camera tampering detected',
          acknowledged: false,
        },
      ])
    }, 500)
  }, [])

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = severityFilter === 'all' || event.severity === severityFilter
    return matchesSearch && matchesFilter
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const acknowledgeEvent = (eventId: string) => {
    setEvents(
      events.map((event) =>
        event.id === eventId ? { ...event, acknowledged: true } : event
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
          <p className="text-slate-400">Monitor and manage system events and alerts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-700">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`p-6 hover:bg-slate-700/50 transition-colors ${
                !event.acknowledged ? 'bg-slate-700/30' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div
                    className={`p-3 rounded-lg border ${getSeverityColor(event.severity)}`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{event.type}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSeverityColor(
                          event.severity
                        )}`}
                      >
                        {event.severity}
                      </span>
                      {!event.acknowledged && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                          New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                      <div className="flex items-center space-x-1">
                        <Camera className="w-4 h-4" />
                        <span>{event.camera}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{format(event.timestamp, 'MMM dd, yyyy HH:mm:ss')}</span>
                      </div>
                    </div>
                    <p className="text-slate-300">{event.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!event.acknowledged && (
                    <button
                      onClick={() => acknowledgeEvent(event.id)}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No events found</p>
        </div>
      )}
    </div>
  )
}

export default Events


