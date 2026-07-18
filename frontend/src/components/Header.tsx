import { useState, useEffect, useRef } from 'react'
import { Bell, Search, X, AlertTriangle, Shield, CheckCircle, Play } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface Notification {
  _id: string
  type: string
  severity: 'high' | 'medium' | 'low'
  description: string
  acknowledged: boolean
  createdAt: string
  anomalyScore?: number
  cameraId?: string
  recordingPath?: string
  recordingName?: string
  clipStartTime?: number
}

const Header = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedClip, setSelectedClip] = useState<Notification | null>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/dashboard/events?limit=10')
      setNotifications(res.data)
      setUnreadCount(res.data.filter((n: Notification) => !n.acknowledged).length)
    } catch (err) {
      console.error('Failed to fetch notifications')
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  const acknowledgeAll = async () => {
    try {
      const unacked = notifications.filter(n => !n.acknowledged)
      await Promise.all(unacked.map(n => api.put(`/dashboard/events/${n._id}/acknowledge`)))
      setNotifications(prev => prev.map(n => ({ ...n, acknowledged: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to acknowledge all')
    }
  }

  const acknowledge = async (id: string) => {
    try {
      await api.put(`/dashboard/events/${id}/acknowledge`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, acknowledged: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to acknowledge')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default: return <Shield className="w-4 h-4 text-blue-400" />
    }
  }

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search cameras, events..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button onClick={acknowledgeAll}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif._id}
                        className={`px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${!notif.acknowledged ? 'bg-slate-700/20' : ''}`}>
                        <div className="flex items-start justify-between space-x-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={`mt-0.5 p-1.5 rounded-lg border ${getSeverityColor(notif.severity)}`}>
                              {getSeverityIcon(notif.severity)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-white text-sm font-medium truncate">{notif.type}</span>
                                {!notif.acknowledged && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-slate-400 text-xs truncate">{notif.description}</p>
                              {notif.anomalyScore !== undefined && (
                                <div className="mt-1 flex items-center space-x-2">
                                  <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${notif.anomalyScore > 0.8 ? 'bg-red-500' : notif.anomalyScore > 0.5 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                      style={{ width: `${notif.anomalyScore * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-400">{(notif.anomalyScore * 100).toFixed(0)}%</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-slate-500 text-xs">
                                  {new Date(notif.createdAt).toLocaleString()}
                                </p>
                                {notif.recordingPath && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedClip(notif) }}
                                    className="flex items-center space-x-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors">
                                    <Play className="w-3 h-3" />
                                    <span>View Clip</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          {!notif.acknowledged && (
                            <button onClick={() => acknowledge(notif._id)}
                              className="flex-shrink-0 p-1 text-slate-400 hover:text-green-400 transition-colors"
                              title="Mark as read">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-700">
                  <button
                    onClick={() => { navigate('/events'); setShowNotifications(false) }}
                    className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    View all events →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Video Clip Modal */}
      {selectedClip && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
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
              <video ref={videoRef} controls className="w-full rounded-lg max-h-96">
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="px-6 py-3 bg-slate-900/50 rounded-b-xl flex items-center justify-between text-xs text-slate-400">
              <span>Detected at: {new Date(selectedClip.createdAt).toLocaleString()}</span>
              <span className={`px-2 py-1 rounded font-medium ${getSeverityColor(selectedClip.severity)}`}>
                {selectedClip.severity.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
