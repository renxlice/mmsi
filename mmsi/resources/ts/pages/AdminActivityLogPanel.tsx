import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '@/assets/activityLog.css';

type ActivityLog = {
  id: string;
  user: {
    name: string;
  } | null;
  action_type: string;
  detail: string;
  timestamp: string;
};

type User = {
  name: string;
  role: string;
};

const AdminActivityLogPanel: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      Accept: 'application/json',
    },
  });

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/admin/activity-log', authHeader());
      const logsArray = res.data?.data?.data || []; // handle pagination
      if (Array.isArray(logsArray)) {
        setLogs(logsArray);
      } else {
        console.warn('⚠️ Unexpected response format:', res.data);
        setLogs([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch activity logs:', err);
      navigate('/login');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/user', authHeader());
      const userData = res.data?.user ?? res.data;
      setCurrentUser(userData);
    } catch (err) {
      console.error('❌ Failed to fetch current user:', err);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchLogs();
  }, [navigate]);

  return (
    <div className="c_admin-panel-frame">
      <aside>
        <div>
          <div className="sidebar-title">MMSI</div>
          <nav>
            <a href="/admin/dashboard">Home</a>
            <a href="/admin/monitoring-instruksi-nominee-view">Monitoring Instruksi Nominee</a>
            <a href="/admin/breakdown-audit-view">Breakdown & Audit</a>
            <a href="/admin/admin-activity-log-panel" className="active">Activity Log</a>
          </nav>
        </div>
        <div>
          <div className="profile-card">
            <div>
              <div className="font-bold text-sm">{currentUser?.name || 'Memuat...'}</div>
              <div className="role">{currentUser?.role || ''}</div>
            </div>
          </div>
          <div className="action-buttons">
            <button className="logout" onClick={() => navigate('/logout')}>Log Out</button>
          </div>
        </div>
      </aside>

      <main>
        <h1>Activity Log</h1>
        <div className="card overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Daftar Activity</h2>
          <table className="table-auto w-full text-sm activity-log-table">
            <thead className="bg-[#1e3a8a] text-white">
              <tr>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Action Type</th>
                <th className="p-2 text-left">Activity Detail</th>
                <th className="p-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Tidak ada aktivitas ditemukan.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={`${log.id}-${log.timestamp}`} className="border-t hover:bg-gray-100">
                    <td className="p-2">{log.user?.name || <i className="text-gray-400">Unknown</i>}</td>
                    <td className="p-2">{log.action_type}</td>
                    <td className="p-2">{log.detail}</td>
                    <td className="p-2">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminActivityLogPanel;
