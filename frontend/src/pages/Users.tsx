import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users as UsersIcon, Plus, Search, Shield, Settings, Trash2 } from 'lucide-react'
import api from '../lib/api'

interface User {
  _id: string
  username: string
  role: 'Admin' | 'Operator'
  createdAt: string
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [roleMsg, setRoleMsg] = useState({ id: '', text: '', error: false })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users')
      setUsers(res.data)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(users.filter(u => u._id !== id))
    } catch {
      alert('Failed to delete user')
    }
  }

  const handleRoleChange = async (id: string, newRole: 'Admin' | 'Operator') => {
    setRoleMsg({ id, text: '', error: false })
    try {
      await api.put(`/profile/role/${id}`, { role: newRole })
      setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u))
      setRoleMsg({ id, text: 'Role updated!', error: false })
      setTimeout(() => setRoleMsg({ id: '', text: '', error: false }), 2000)
    } catch (err: any) {
      setRoleMsg({ id, text: err.response?.data?.message || 'Failed to update role', error: true })
    }
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-slate-400">Manage system users and permissions</p>
        </div>
        <Link
          to="/register"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && <p className="text-slate-400 text-center py-12">Loading users...</p>}
      {error && <p className="text-red-400 text-center py-12">{error}</p>}

      {!loading && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Change Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredUsers.map((user) => {
                  const RoleIcon = user.role === 'Admin' ? Shield : Settings
                  return (
                    <tr key={user._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-white">{user.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <RoleIcon className="w-4 h-4 text-slate-400" />
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${
                            user.role === 'Admin'
                              ? 'bg-red-500/20 text-red-400 border-red-500/50'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value as 'Admin' | 'Operator')}
                            className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Operator">Operator</option>
                          </select>
                          {roleMsg.id === user._id && roleMsg.text && (
                            <span className={`text-xs ${roleMsg.error ? 'text-red-400' : 'text-green-400'}`}>
                              {roleMsg.text}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(user._id, user.username)}
                          className="p-2 hover:bg-red-600 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No users found</p>
        </div>
      )}
    </div>
  )
}

export default Users
