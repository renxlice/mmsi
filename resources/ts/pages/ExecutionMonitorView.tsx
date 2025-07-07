import React, { useEffect, useState } from 'react';
import api, { getCurrentUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '@/assets/executionMonitor.css';
import { User } from '../types/user';

interface Breakdown {
  id: string;
  stock: string;
  price: number;
  lots: number;
  status: string;
  execution_time: string | null;
  auto_executed: boolean;
  nominee: {
    name: string;
    email: string;
  };
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'WAITING':
      return 'status-badge status-waiting';
    case 'EXECUTED':
      return 'status-badge status-executed';
    case 'IN_PROGRESS':
      return 'status-badge status-inprogress';
    default:
      return 'status-badge status-unknown';
  }
};

const ExecutionMonitor: React.FC = () => {
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userRes = await getCurrentUser();
        setUser(userRes.data.user);

        const res = await api.get('/strategist/monitor-execution');
        setBreakdowns(res.data.data || []);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const filteredBreakdowns = breakdowns.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.nominee?.name.toLowerCase().includes(term) ||
      b.stock.toLowerCase().includes(term) ||
      b.status.toLowerCase().includes(term) ||
      (b.auto_executed ? 'auto' : 'manual').includes(term)
    );
  });

  return (
    <div className="c_strategist-panel-ho-frame">
      {/* Sidebar */}
      <div className="sidebar">
        <div>
          <div className="sidebar-title">MMSI</div>
          <nav className="sidebar-nav">
            <a href="/strategist/dashboard">Home</a>
            <a href="/strategist/order-history">Order History</a>
            <a href="/strategist/daily-execution">Grafik Eksekusi Harian</a>
            <a href="/strategist/execution-monitor-view" className="active">Execution Monitor</a>
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
            <h2><span style={{ fontWeight: 600 }}>Execution Monitor</span></h2>
            <input
              type="text"
              placeholder="Search by stock, status, or nominee"
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="loading">Loading...</p>
          ) : (
            <div className="table-wrapper">
              <table className="execution-table">
                <thead>
                  <tr>
                    <th>Nominee</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Lots</th>
                    <th>Status</th>
                    <th>Executed At</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBreakdowns.length > 0 ? (
                    filteredBreakdowns.map((b) => (
                      <tr key={b.id}>
                        <td>{b.nominee?.name}</td>
                        <td>{b.stock}</td>
                        <td>{b.price}</td>
                        <td>{b.lots}</td>
                        <td>
                          <span className={getStatusClass(b.status)}>
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {b.execution_time
                            ? new Date(b.execution_time).toLocaleString('id-ID')
                            : '-'}
                        </td>
                        <td>{b.auto_executed ? 'Auto' : 'Manual'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">No matching results found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutionMonitor;
