import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import api, { getCurrentUser } from '../services/api';
import { User } from '../types/user';
import '@/assets/daily-execution.css';

Chart.register(...registerables);

interface Breakdown {
  execution_time: string;
  status: string;
}

export default function GrafikEksekusiHarian() {
  const [executedPerDate, setExecutedPerDate] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndExecution();
  }, []);

  const fetchUserAndExecution = async () => {
    try {
      setLoading(true);
      const userRes = await getCurrentUser();
      setUser(userRes.data.user);
      await fetchExecutionData();
    } catch (err) {
      console.error('❌ Error fetching user or data:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutionData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/strategist/monitor-execution');
      const data: Breakdown[] = res.data.data || [];

      const filtered = data.filter((b) => {
        if (b.status !== 'EXECUTED') return false;
        if (!b.execution_time) return false;

        const execDate = new Date(b.execution_time).toISOString().split('T')[0];

        if (startDate && execDate < startDate) return false;
        if (endDate && execDate > endDate) return false;

        return true;
      });

      const countPerDate: Record<string, number> = {};
      filtered.forEach((b) => {
        const date = new Date(b.execution_time).toISOString().split('T')[0];
        countPerDate[date] = (countPerDate[date] || 0) + 1;
      });

      setExecutedPerDate(countPerDate);
    } catch (err) {
      console.error('❌ Gagal mengambil data eksekusi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const chartData = {
  labels: Object.keys(executedPerDate).sort(),
  datasets: [
    {
      label: 'Jumlah Eksekusi',
      data: Object.keys(executedPerDate)
        .sort()
        .map((date) => executedPerDate[date]),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#1e293b',
        font: {
          size: 12,
          weight: 'bold' as const,
        },
      },
    },
    tooltip: {
      backgroundColor: 'white',
      titleColor: '#1e293b',
      bodyColor: '#475569',
      borderColor: '#e5e7eb',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Tanggal',
        color: '#1e293b',
        font: {
          size: 13,
          weight: 'bold' as const,
        },
      },
      ticks: { color: '#475569' },
      grid: { color: '#f1f5f9' },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Jumlah Eksekusi',
        color: '#1e293b',
        font: {
          size: 13,
          weight: 'bold' as const,
        },
      },
      ticks: { color: '#475569' },
      grid: { color: '#f1f5f9' },
    },
  },
};

  return (
    <div className="c_strategist-panel-ho-frame">
      {/* Sidebar */}
      <div className="sidebar">
        <div>
          <h2 className="sidebar-title">MMSI</h2>
          <nav className="sidebar-nav">
            <a href="/strategist/dashboard">Home</a>
            <a href="/strategist/order-history">Order History</a>
            <a href="/strategist/daily-execution" className="active">Grafik Eksekusi Harian</a>
            <a href="/strategist/execution-monitor-view">Execution Monitor</a>
          </nav>
        </div>

        <div>
          <div className="strategist-info">
            <div>
              <p className="font-bold text-sm">{user?.name || '...'}</p>
              <p className="role">{user?.role || '...'}</p>
            </div>
          </div>

          <div className="sidebar-buttons">
            {/* <button className="settings">Settings</button> */}
            <button className="logout" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-box">
          <div className="header">
            <h2>Grafik Eksekusi Harian</h2>
          </div>

          <div className="date-filter-form">
            <div className="date-field">
              <label htmlFor="start-date">Dari Tanggal</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-field">
              <label htmlFor="end-date">Sampai Tanggal</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button className="btn-terapkan" onClick={fetchExecutionData}>
              Terapkan
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading grafik...</p>
          ) : Object.keys(executedPerDate).length === 0 ? (
            <p className="text-gray-500">Belum ada data eksekusi.</p>
          ) : (
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
