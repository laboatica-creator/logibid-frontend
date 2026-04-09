import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import RequestsPage from './pages/RequestsPage'
import RequestDetailPage from './pages/RequestDetailPage'
import PaymentsPage from './pages/PaymentsPage'

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminRequestsPage from './pages/AdminRequestsPage'
import AdminBidsPage from './pages/AdminBidsPage'
import AdminPaymentsPage from './pages/AdminPaymentsPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/requests" element={user ? <RequestsPage /> : <Navigate to="/login" />} />
        <Route path="/requests/:id" element={user ? <RequestDetailPage /> : <Navigate to="/login" />} />
        <Route path="/payments" element={user ? <PaymentsPage /> : <Navigate to="/login" />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/users" element={user?.role === 'admin' ? <AdminUsersPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/requests" element={user?.role === 'admin' ? <AdminRequestsPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/bids" element={user?.role === 'admin' ? <AdminBidsPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/payments" element={user?.role === 'admin' ? <AdminPaymentsPage /> : <Navigate to="/dashboard" />} />

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App