import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Cameras from './pages/Cameras'
import CameraDetail from './pages/CameraDetail'
import AddCamera from './pages/AddCamera'
import EditCamera from './pages/EditCamera'
import Events from './pages/Events'
import Users from './pages/Users'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/cameras" replace />} />
                  <Route path="/cameras" element={<Cameras />} />
                  <Route path="/cameras/:id" element={<CameraDetail />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Admin only */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>
                  } />
                  <Route path="/cameras/new" element={
                    <ProtectedRoute adminOnly><AddCamera /></ProtectedRoute>
                  } />
                  <Route path="/cameras/:id/edit" element={
                    <ProtectedRoute adminOnly><EditCamera /></ProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute adminOnly><Users /></ProtectedRoute>
                  } />
                  <Route path="/register" element={
                    <ProtectedRoute adminOnly><Register /></ProtectedRoute>
                  } />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
