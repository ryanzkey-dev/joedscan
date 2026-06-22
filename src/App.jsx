import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/Layout/DashboardLayout'
import Login from './pages/Login'
import AdminOverview from './pages/admin/AdminOverview'
import AddTechnician from './pages/admin/AddTechnician'
import RawData from './pages/admin/RawData'
import Dispatch from './pages/admin/Dispatch'
import Repair from './pages/admin/Repair'
import AddMaterials from './pages/admin/materials/AddMaterials'
import SendMaterials from './pages/admin/materials/SendMaterials'
import AdminTransferMaterials from './pages/admin/materials/TransferMaterials'
import Inventory from './pages/admin/materials/Inventory'
import Transactions from './pages/admin/Transactions'
import AdminAttendance from './pages/admin/Attendance'
import TechnicianDashboard from './pages/technician/TechnicianDashboard'
import TechnicianForm from './pages/technician/TechnicianForm'
import MyEncodedRecords from './pages/technician/MyEncodedRecords'
import AssignedJobOrders from './pages/technician/AssignedJobOrders'
import AssignedRepairs from './pages/technician/AssignedRepairs'
import MyStocks from './pages/technician/materials/MyStocks'
import TechnicianTransferMaterials from './pages/technician/materials/TransferMaterials'
import TechnicianAttendance from './pages/technician/Attendance'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/technician'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
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
              path="/admin/raw-data"
              element={
                <ProtectedRoute role="admin">
                  <DashboardLayout>
                    <RawData />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dispatch"
              element={
                <ProtectedRoute role="admin">
                  <DashboardLayout>
                    <Dispatch />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/repair"
              element={
                <ProtectedRoute role="admin">
                  <DashboardLayout>
                    <Repair />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/materials/add"
              element={
                <ProtectedRoute role="admin">
                  <DashboardLayout>
                    <AddMaterials />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/materials/send"
              element={
                <ProtectedRoute role="admin">
                  <DashboardLayout>
                    <SendMaterials />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/materials/transfer"
              element={
                <ProtectedRoute role="admin">
                  <DashboardLayout>
                    <AdminTransferMaterials />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/materials/inventory"
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
              path="/admin/attendance"
              element={
                <ProtectedRoute role="admin">
                  <DashboardLayout>
                    <AdminAttendance />
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
            <Route
              path="/technician/attendance"
              element={
                <ProtectedRoute role="technician">
                  <DashboardLayout>
                    <TechnicianAttendance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/technician/assigned-job-orders"
              element={
                <ProtectedRoute role="technician">
                  <DashboardLayout>
                    <AssignedJobOrders />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/assigned-repairs"
              element={
                <ProtectedRoute role="technician">
                  <DashboardLayout>
                    <AssignedRepairs />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/materials/my-stocks"
              element={
                <ProtectedRoute role="technician">
                  <DashboardLayout>
                    <MyStocks />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/materials/transfer"
              element={
                <ProtectedRoute role="technician">
                  <DashboardLayout>
                    <TechnicianTransferMaterials />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
