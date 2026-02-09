import { useState } from 'react'
import { Save, Bell, Shield, Camera, Database } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    recording: {
      autoRecord: true,
      retentionDays: 30,
      quality: 'high',
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
    },
    system: {
      timezone: 'UTC',
      language: 'en',
    },
  })

  const handleSave = () => {
    // Simulate API call
    console.log('Saving settings:', settings)
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Configure system settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Push Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, push: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">SMS Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, sms: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Recording */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Camera className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-white">Recording</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Auto Record</span>
              <input
                type="checkbox"
                checked={settings.recording.autoRecord}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    recording: { ...settings.recording, autoRecord: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <div>
              <label className="block text-slate-300 mb-2">Retention Period (Days)</label>
              <input
                type="number"
                value={settings.recording.retentionDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    recording: {
                      ...settings.recording,
                      retentionDays: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Recording Quality</label>
              <select
                value={settings.recording.quality}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    recording: { ...settings.recording, quality: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Two-Factor Authentication</span>
              <input
                type="checkbox"
                checked={settings.security.twoFactor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactor: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <div>
              <label className="block text-slate-300 mb-2">Session Timeout (Minutes)</label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      sessionTimeout: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* System */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-white">System</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Timezone</label>
              <select
                value={settings.system.timezone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    system: { ...settings.system, timezone: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                <option value="GMT">GMT</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Language</label>
              <select
                value={settings.system.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    system: { ...settings.system, language: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings


