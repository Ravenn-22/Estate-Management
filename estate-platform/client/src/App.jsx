import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ManagerDashboard from './pages/ManagerDashboard';
import TenantDashboard from './pages/TenantDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import DashboardLayout from './components/DashboardLayout';
import Units from './pages/manager/Units';
import Leases from './pages/manager/Leases';
import MyLease from './pages/tenant/MyLease';
import ManagerInvoices from './pages/manager/Invoices';
import TenantInvoices from './pages/tenant/Invoices';
import ManagerMaintenance from './pages/manager/Maintenance';
import TenantMaintenance from './pages/tenant/Maintenance';
import ManagerDocuments from './pages/manager/Documents';
import TenantDocuments from './pages/tenant/Documents';
import ManagerAnnouncements from './pages/manager/Announcements';
import TenantAnnouncements from './pages/tenant/Announcements';

function App() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRole="MANAGER">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="units" element={<Units />} />
          <Route path="leases" element={<Leases />} />
          <Route path="invoices" element={<ManagerInvoices />} />
          <Route path="maintenance" element={<ManagerMaintenance />} />
          <Route path="documents" element={<ManagerDocuments />} />
          <Route path="announcements" element={<ManagerAnnouncements />} />
        </Route>

        <Route
          path="/tenant"
          element={
            <ProtectedRoute allowedRole="TENANT">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TenantDashboard />} />
          <Route path="lease" element={<MyLease />} />
          <Route path="invoices" element={<TenantInvoices />} />
          <Route path="maintenance" element={<TenantMaintenance />} />
          <Route path="documents" element={<TenantDocuments />} />
          <Route path="announcements" element={<TenantAnnouncements />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </PageTransition>
  );
}

export default App;