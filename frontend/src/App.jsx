import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Cars from './pages/Cars'
import CarDetail from './pages/CarDetail'
import Booking from './pages/Booking'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoadingScreen from './components/LoadingScreen'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminMessages from "./pages/AdminMessages"
import { Toaster } from 'react-hot-toast'
import Success from './pages/Success'

// Protected route wrapper
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <div className="flex flex-col min-h-screen bg-night-900">
      
      {/* 🔥 Toaster yaha hona chahiye */}
      <Toaster position="top-right" />

      <Navbar />

      <main className="flex-1">
        <Routes>

          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
<Route path="/success" element={<Success />} />
<Route path="/cancel" element={<h1 className="text-white mt-40 text-center">Payment Cancelled ❌</h1>} />
          {/* ✅ FIXED */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected */}
          <Route path="/booking/:id" element={
            <ProtectedRoute><Booking /></ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/messages" element={<AdminMessages />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>

      <Footer />
    </div>
  )
}