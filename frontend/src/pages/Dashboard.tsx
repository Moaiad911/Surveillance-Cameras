import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, AlertTriangle, Activity, Video, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface DashboardStats {
  totalCameras: number
  activeCameras: number
  totalEvents: number
  recentEvents: number
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCameras: 0,
    activeCameras: 0,
    totalEvents: 0,
    recentEvents: 0,
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalCameras: 24,
        activeCameras: 22,
        totalEvents: 156,
        recentEvents: 12,
      })
    }, 500)
  }, [])

  const statCards = [
    {
      title: 'Total Cameras',
      value: stats.totalCameras,
      icon: Camera,
      color: 'bg-blue-500',
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Cameras',
      value: stats.activeCameras,
      icon: Video,
      color: 'bg-green-500',
      change: `${Math.round((stats.activeCameras / stats.totalCameras) * 100)}%`,
      changeType: 'positive' as const,
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      change: '+12',
      changeType: 'positive' as const,
    },
    {
      title: 'Recent Events (24h)',
      value: stats.recentEvents,
      icon: Activity,
      color: 'bg-red-500',
      change: '+3',
      changeType: 'positive' as const,
    },
  ]

  const recentEvents = [
    { id: 1, type: 'Motion Detected', camera: 'Camera 01', time: new Date(), severity: 'high' },
    { id: 2, type: 'Object Detected', camera: 'Camera 05', time: new Date(Date.now() - 3600000), severity: 'medium' },
    { id: 3, type: 'Motion Detected', camera: 'Camera 12', time: new Date(Date.now() - 7200000), severity: 'high' },
    { id: 4, type: 'System Alert', camera: 'Camera 08', time: new Date(Date.now() - 10800000), severity: 'low' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Monitor your surveillance system at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-slate-400 text-sm">{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Events</h2>
            <Link
              to="/events"
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      event.severity === 'high'
                        ? 'bg-red-500'
                        : event.severity === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <p className="text-white font-medium">{event.type}</p>
                    <p className="text-slate-400 text-sm">{event.camera}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{format(event.time, 'HH:mm')}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/cameras"
              className="block w-full p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-white"
            >
              <div className="flex items-center space-x-3">
                <Camera className="w-5 h-5 text-primary-400" />
                <span>Manage Cameras</span>
              </div>
            </Link>
            <Link
              to="/events"
              className="block w-full p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-white"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span>View All Events</span>
              </div>
            </Link>
            <Link
              to="/settings"
              className="block w-full p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-white"
            >
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-green-400" />
                <span>System Settings</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard


