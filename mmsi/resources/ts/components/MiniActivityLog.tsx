import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  detail: string;
  timestamp: string;
  user?: {
    name: string;
  };
}

const MiniActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/strategist/activity-log');
      const fetchedLogs = res?.data?.data;

      if (!Array.isArray(fetchedLogs)) {
        throw new Error('Format data aktivitas tidak valid.');
      }

      setLogs(fetchedLogs);
    } catch (err: any) {
      console.error('❌ Gagal memuat activity log:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Gagal memuat aktivitas.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="activity-log-box">
      <div className="activity-header">
        <span className="activity-icon">🕒</span>
        <h3>Aktivitas Terbaru</h3>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-400">Belum ada aktivitas.</p>
      ) : (
        <ul className="activity-log-list">
          {logs.map((log, index) => (
            <li key={`${log.id}-${index}`} className="activity-log-item">
              <div className="log-user">{log.user?.name || 'User'}</div>
              <div className="log-detail">{log.detail || '-'}</div>
              <div className="log-time">
                {log.timestamp
                  ? new Date(log.timestamp).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })
                  : 'Waktu tidak diketahui'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MiniActivityLog;
