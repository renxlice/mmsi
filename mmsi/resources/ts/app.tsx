import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StrategistPanel from './pages/StrategistPanel';
import AdminPanel from './pages/AdminPanel';
import NomineePanel from './pages/NomineePanel';
import LoginPage from './pages/LoginPage';
import AdminActivityLogPanel from './pages/AdminActivityLogPanel';
import OrderHistoryPage from './pages/OrderHistory';
import GrafikEksekusiHarian from './pages/DailyExecution';
import ExecutionMonitor from './pages/ExecutionMonitorView';
import MonitoringInstruksiNomineeView from './pages/MonitoringInstruksiNomineeView';
import BreakdownAuditPanel from './pages/BreakdownAuditView';
import RoleRoute from './components/RoleRoute';

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter basename="/panel">
      <div className={isAuthenticated ? 'ml-64' : ''}>
        <Routes>
          {/* 🔐 Login */}
          <Route path="/" element={<LoginPage />} />

          {/* 🧠 Strategist */}
          <Route
            path="/strategist/dashboard"
            element={
              <RoleRoute role="STRATEGIST">
                <StrategistPanel />
              </RoleRoute>
            }
          />
          <Route
            path="/strategist/order-history"
            element={
              <RoleRoute role="STRATEGIST">
                <OrderHistoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/strategist/daily-execution"
            element={
              <RoleRoute role="STRATEGIST">
                <GrafikEksekusiHarian />
              </RoleRoute>
            }
          />
          <Route
            path="/strategist/execution-monitor-view"
            element={
              <RoleRoute role="STRATEGIST">
                <ExecutionMonitor />
              </RoleRoute>
            }
          />

          {/* 🛡️ Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute role="ADMIN">
                <AdminPanel />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/monitoring-instruksi-nominee-view"
            element={
              <RoleRoute role="ADMIN">
                <MonitoringInstruksiNomineeView />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/breakdown-audit-view"
            element={
              <RoleRoute role="ADMIN">
                <BreakdownAuditPanel />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/admin-activity-log-panel"
            element={
              <RoleRoute role="ADMIN">
                <AdminActivityLogPanel />
              </RoleRoute>
            }
          />

          {/* 👤 Nominee */}
          <Route
            path="/nominee/dashboard"
            element={
              <RoleRoute role="NOMINEE">
                <NomineePanel />
              </RoleRoute>
            }
          />

          {/* ❌ Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
