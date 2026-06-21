import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/Layout/DashboardLayout'
import Login from './pages/Login'
import AdminOverview from './pages/admin/AdminOverview'
import AddTechnician from './pages/admin/AddTechnician'
import Subscribers from './pages/admin/Subscribers'
import Inventory from './pages/admin/Inventory'
import Transactions from './pages/admin/Transactions'
import TechnicianDashboard from './pages/technician/TechnicianDashboard'
import TechnicianForm from './pages/technician/TechnicianForm'
import MyEncodedRecords from './pages/technician/MyEncodedRecords'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/technician'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <DashboardLayout>
                  <AdminOverview />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-technician"
            element={
              <ProtectedRoute role="admin">
                <DashboardLayout>
                  <AddTechnician />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscribers"
            element={
              <ProtectedRoute role="admin">
                <DashboardLayout>
                  <Subscribers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute role="admin">
                <DashboardLayout>
                  <Inventory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <ProtectedRoute role="admin">
                <DashboardLayout>
                  <Transactions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/technician"
            element={
              <ProtectedRoute role="technician">
                <DashboardLayout>
                  <TechnicianDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/form"
            element={
              <ProtectedRoute role="technician">
                <DashboardLayout>
                  <TechnicianForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/records"
            element={
              <ProtectedRoute role="technician">
                <DashboardLayout>
                  <MyEncodedRecords />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
