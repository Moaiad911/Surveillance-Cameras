import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Camera,
  Bell,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/cameras', icon: Camera, label: 'Cameras' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/events', icon: Bell, label: 'Events' },
    ...(user?.role === 'admin' ? [{ path: '/users', icon: Users, label: 'Users' }] : []),
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-primary-400">Surveillance System</h1>
        <p className="text-sm text-slate-400 mt-1">Camera Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="mb-4 px-4 py-2 bg-slate-700 rounded-lg">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>
          <p className="text-xs text-primary-400 mt-1 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar


