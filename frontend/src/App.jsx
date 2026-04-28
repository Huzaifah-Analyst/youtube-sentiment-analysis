import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import History from './pages/History'
import Compare from './pages/Compare'
import Admin from './pages/Admin'
import Header from './components/layout/Header'
import { ToastContainer } from './components/ui/Toast'

// Page titles per route
const PAGE_TITLES = {
  '/': 'YT Vibe Check | Dashboard',
  '/history': 'YT Vibe Check | History',
  '/compare': 'YT Vibe Check | Compare',
  '/login': 'YT Vibe Check | Login',
  '/signup': 'YT Vibe Check | Sign Up',
  '/admin': 'YT Vibe Check | Admin',
}

function TitleManager() {
  const location = useLocation()
  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] || 'YT Vibe Check'
  }, [location.pathname])
  return null
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div style={{ width: '48px', height: '48px', border: '4px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%' }} className="spin" />
    </div>
  )
  if (!token) return <Navigate to="/login" />
  return children
}

// Admin Protected Route
const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div style={{ width: '48px', height: '48px', border: '4px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%' }} className="spin" />
    </div>
  )
  if (!token) return <Navigate to="/login" />
  if (user && !user.is_admin) return <Navigate to="/" />
  return children
}

function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '28px 16px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      marginTop: '60px',
      color: '#475569',
      fontSize: '0.8rem',
      fontWeight: 500,
      letterSpacing: '0.04em',
    }}>
      YT Vibe Check &nbsp;|&nbsp; FYP 2026 &nbsp;|&nbsp; UET Taxila
    </footer>
  )
}

function AppContent() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowY: 'auto' }}>
      {/* Background Gradient Mesh */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(100px)' }} />
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <TitleManager />
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <Compare />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
