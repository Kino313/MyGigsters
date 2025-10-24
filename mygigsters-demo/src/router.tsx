import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import WorkerDashboard from './pages/WorkerDashboard'
import WorkerActivity from './pages/WorkerActivity'
import BenefitsCenter from './pages/BenefitsCenter'
import AdminRules from './pages/AdminRules'
import AdminUsersLogs from './pages/AdminUsersLogs'

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />

    {/* Worker */}
    <Route path="/worker/dashboard" element={<WorkerDashboard />} />
    <Route path="/worker/activity" element={<WorkerActivity />} />
    <Route path="/worker/benefits" element={<BenefitsCenter />} />

    {/* Admin */}
    <Route path="/admin/rules" element={<AdminRules />} />
    <Route path="/admin/users-logs" element={<AdminUsersLogs />} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
)