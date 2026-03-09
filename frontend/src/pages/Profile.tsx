import { useState, useEffect } from 'react'
import { User, Lock, Shield, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

const Profile = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()


  const [profile, setProfile] = useState({ username: '', role: '', createdAt: '' })
  const [usernameForm, setUsernameForm] = useState({ username: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [usernameMsg, setUsernameMsg] = useState({ text: '', error: false })
  const [passwordMsg, setPasswordMsg] = useState({ text: '', error: false })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile')
        setProfile(res.data)
        setUsernameForm({ username: res.data.username })
      } catch {
        console.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleUsernameSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    setUsernameMsg({ text: '', error: false })
    try {
      const res = await api.put('/profile', { username: usernameForm.username })
      setProfile(prev => ({ ...prev, username: res.data.user.username }))
      setUsernameMsg({ text: 'Username updated successfully!', error: false })
    } catch (err: any) {
      setUsernameMsg({ text: err.response?.data?.message || 'Failed to update username', error: true })
    }
  }

  const handlePasswordSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    setPasswordMsg({ text: '', error: false })

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', error: true })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters', error: true })
      return
    }

    try {
      await api.put('/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordMsg({ text: 'Password updated successfully!', error: false })
    } catch (err: any) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to update password', error: true })
    }
  }

  if (loading) return <p className="text-slate-400 text-center py-12">Loading...</p>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-slate-400">Manage your account settings</p>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile.username}</h2>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              profile.role === 'Admin'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {profile.role}
            </span>
            <p className="text-slate-400 text-sm mt-1">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Change Username */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Change Username</h3>
        </div>

        {usernameMsg.text && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            usernameMsg.error
              ? 'bg-red-500/10 border border-red-500 text-red-400'
              : 'bg-green-500/10 border border-green-500 text-green-400'
          }`}>
            {usernameMsg.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">New Username</label>
          <input
            value={usernameForm.username}
            onChange={(e) => setUsernameForm({ username: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new username"
          />
        </div>
        <button
          onClick={handleUsernameSubmit}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Shield className="w-4 h-4" />
          <span>Update Username</span>
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Lock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
        </div>

        {passwordMsg.text && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            passwordMsg.error
              ? 'bg-red-500/10 border border-red-500 text-red-400'
              : 'bg-green-500/10 border border-green-500 text-green-400'
          }`}>
            {passwordMsg.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm new password"
          />
        </div>
        <button
          onClick={handlePasswordSubmit}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Lock className="w-4 h-4" />
          <span>Update Password</span>
        </button>
      </div>
    </div>
  )
}

export default Profile
