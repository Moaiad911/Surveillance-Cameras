import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, AlertTriangle, Activity, Video, Clock } from 'lucide-react'
import { format } from 'date-fns'
import api from '../lib/api'

interface DashboardStats {
  totalCameras: number
  activeCameras: number
  totalEvents: number
  recentEvents: number
}

interface Event {
  _id: string
  type: string
  camera: string
  severity: 'low' | 'medium' | 'high'
  acknowledged: boolean
  createdAt: string
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCameras: 0,
    activeCameras: 0,
    totalEvents: 0,
    recentEvents: 0,
  })
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/events')
        ])
        setStats(statsRes.data)
        setEvents(eventsRes.data)
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    {
      title: 'Total Cameras',
      value: stats.totalCameras,
      icon: Camera,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Cameras',
      value: stats.activeCameras,
      icon: Video,
      color: 'bg-green-500',
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
    },
    {
      title: 'Recent Events (24h)',
      value: stats.recentEvents,
      icon: Activity,
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Monitor your surveillance system at a glance</p>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-12">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.title}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-slate-400 text-sm">{stat.title}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Recent Events</h2>
                <Link to="/events" className="text-sm text-blue-400 hover:text-blue-300">
                  View all
                </Link>
              </div>
              {events.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No events yet</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event._id}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          event.severity === 'high' ? 'bg-red-500' :
                          event.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-white font-medium">{event.type}</p>
                          <p className="text-slate-400 text-sm">{event.camera}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-sm flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(event.createdAt), 'HH:mm')}</span>
                        </p>
                        {event.acknowledged && (
                          <span className="text-xs text-green-400">Acknowledged</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/cameras"
                  className="block w-full p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-white">
                  <div className="flex items-center space-x-3">
                    <Camera className="w-5 h-5 text-blue-400" />
                    <span>Manage Cameras</span>
                  </div>
                </Link>
                <Link to="/events"
                  className="block w-full p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-white">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span>View All Events</span>
                  </div>
                </Link>
                <Link to="/settings"
                  className="block w-full p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-white">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span>System Settings</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
