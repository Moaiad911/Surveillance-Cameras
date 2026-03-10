import { useEffect, useState } from 'react'
import { Trash2, Shield, Edit, X, Eye, EyeOff, UserPlus } from 'lucide-react'
import api from '../lib/api'

interface User {
  _id: string
  username: string
  role: string
  createdAt: string
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ username: '', password: '', role: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [editMsg, setEditMsg] = useState({ text: '', error: false })
  const [saving, setSaving] = useState(false)

  // Add User Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ username: '', password: '', role: 'Operator' })
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [addMsg, setAddMsg] = useState({ text: '', error: false })
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
    } catch (err) {
      console.error('Failed to delete user')
    }
  }

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await api.put(`/profile/role/${id}`, { role })
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u))
    } catch (err) {
      console.error('Failed to update role')
    }
  }

  const openEdit = (user: User) => {
    setEditUser(user)
    setEditForm({ username: user.username, password: '', role: user.role })
    setEditMsg({ text: '', error: false })
    setShowPassword(false)
  }

  const handleEditSubmit = async () => {
    if (!editUser) return
    setSaving(true)
    setEditMsg({ text: '', error: false })
    try {
      const body: any = { role: editForm.role }
      if (editForm.username !== editUser.username) body.username = editForm.username
      if (editForm.password) body.password = editForm.password
      await api.put(`/users/${editUser._id}`, body)
      setUsers(prev => prev.map(u => u._id === editUser._id ? { ...u, username: editForm.username, role: editForm.role } : u))
      setEditMsg({ text: 'User updated successfully!', error: false })
      setTimeout(() => setEditUser(null), 1000)
    } catch (err: any) {
      setEditMsg({ text: err.response?.data?.message || 'Failed to update user', error: true })
    } finally {
      setSaving(false)
    }
  }

  const handleAddSubmit = async () => {
    setAddMsg({ text: '', error: false })
    if (!addForm.username || !addForm.password) {
      setAddMsg({ text: 'Username and password are required', error: true })
      return
    }
    setAdding(true)
    try {
      const res = await api.post('/auth/signup', addForm)
      setUsers(prev => [...prev, res.data.user])
      setAddForm({ username: '', password: '', role: 'Operator' })
      setAddMsg({ text: 'User added successfully!', error: false })
      setTimeout(() => { setShowAddModal(false); fetchUsers() }, 1000)
    } catch (err: any) {
      setAddMsg({ text: err.response?.data?.message || 'Failed to add user', error: true })
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <p className="text-slate-400 text-center py-12">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-slate-400">Manage system users and permissions</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setAddMsg({ text: '', error: false }) }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Operator">Operator</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Add New User</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addMsg.text && (
              <div className={`px-4 py-3 rounded-lg text-sm ${
                addMsg.error
                  ? 'bg-red-500/10 border border-red-500 text-red-400'
                  : 'bg-green-500/10 border border-green-500 text-green-400'
              }`}>
                {addMsg.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
              <input
                value={addForm.username}
                onChange={(e) => setAddForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showAddPassword ? 'text' : 'password'}
                  value={addForm.password}
                  onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowAddPassword(!showAddPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Admin">Admin</option>
                <option value="Operator">Operator</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={adding}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Edit User</h2>
              </div>
              <button onClick={() => setEditUser(null)} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editMsg.text && (
              <div className={`px-4 py-3 rounded-lg text-sm ${
                editMsg.error
                  ? 'bg-red-500/10 border border-red-500 text-red-400'
                  : 'bg-green-500/10 border border-green-500 text-green-400'
              }`}>
                {editMsg.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
              <input
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">New Password <span className="text-slate-500">(leave blank to keep current)</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={editForm.password}
                  onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Admin">Admin</option>
                <option value="Operator">Operator</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
