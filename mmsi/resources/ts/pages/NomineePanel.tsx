import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import '@/assets/c_strategist-panel-ho.css';

type User = {
  name: string;
  role: string;
};

const statusColors: Record<string, string> = {
  NEW: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-600',
  EXECUTED: 'bg-purple-600',
  WAITING: 'bg-orange-400',
};

const NomineePanel: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recheckForm, setRecheckForm] = useState({ kas: '', portofolio: '', pin: '', tanggal: '' });
  const [showReminder, setShowReminder] = useState(false);
  const [reminderClosed, setReminderClosed] = useState(() => localStorage.getItem('reminderClosed') === 'true');

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastDismissed = localStorage.getItem('reminderDismissedDate');
    if (lastDismissed !== today) {
      localStorage.removeItem('reminderClosed');
      localStorage.setItem('reminderDismissedDate', today);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchOrders();
    checkRecheckToday();

    const interval = setInterval(() => {
      fetchOrders();
      checkRecheckToday();
    }, 1000 * 60 * 5);

    return () => clearInterval(interval);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/user');
      setCurrentUser(res.data.user || res.data);
    } catch (err) {
      console.error('[FetchUser Error]', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/nominee/instructions');
      setOrders(res.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const executeOrder = async (id: string) => {
    try {
      await api.post(`/nominee/execute/${id}`);
      await fetchOrders();
      Swal.fire('Berhasil', 'Order berhasil dieksekusi.', 'success');
    } catch (err: any) {
      Swal.fire('Gagal', err?.response?.data?.message || err.message || 'Gagal mengeksekusi order.', 'error');
    }
  };

  const handleRecheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPorto: Record<string, string> = {};
    const entries = recheckForm.portofolio.split(',');
    let validFormat = true;

    entries.forEach((entry) => {
      const [stock, val] = entry.split(':').map((v) => v.trim());
      if (!stock || !val || isNaN(Number(val))) {
        validFormat = false;
      } else {
        parsedPorto[stock] = val;
      }
    });

    if (!validFormat) {
      return Swal.fire('Format Salah', 'Format portofolio tidak valid. Gunakan format: BBCA:100,TLKM:50', 'warning');
    }

    if (!recheckForm.kas || !recheckForm.pin || !recheckForm.tanggal || Object.keys(parsedPorto).length === 0) {
      return Swal.fire('Data Kurang', 'Lengkapi semua field dengan benar.', 'warning');
    }

    try {
      await api.post('/verify-pin', { pin: recheckForm.pin });
    } catch (err: any) {
      return Swal.fire('PIN Salah', err?.response?.data?.error || 'PIN tidak sesuai.', 'error');
    }

    try {
      await api.post('/recheck', {
        kas: recheckForm.kas,
        portofolio: parsedPorto,
        pin: recheckForm.pin,
        tanggal: recheckForm.tanggal,
      });
      Swal.fire('Berhasil', 'Recheck berhasil dikirim.', 'success');
      setRecheckForm({ kas: '', portofolio: '', pin: '', tanggal: '' });
      setShowReminder(false);
      localStorage.removeItem('reminderClosed');
      setReminderClosed(false);
    } catch (err) {
      Swal.fire('Gagal', 'Recheck gagal dikirim.', 'error');
    }
  };

  const checkRecheckToday = async () => {
    try {
      const res = await api.get('/system/auto-recheck');
      const msg = res.data.message?.toLowerCase() || '';
      setShowReminder(msg.includes('belum ada recheck') || msg.includes('recheck belum dilakukan'));
    } catch (err) {
      console.warn('[CheckRecheckToday Error]', err);
    }
  };

  return (
    <div className="c_strategist-panel-ho-frame">
      <aside>
        <div>
          <div className="sidebar-title">MMSI</div>
          <nav>
            <a href="/nominee/dashboard" className="active">Home</a>
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
            <button className="logout" onClick={() => window.location.href = '/logout'}>Log Out</button>
          </div>
        </div>
      </aside>

      <main>
        <h1 className="text-2xl font-bold mb-4">Nominee Panel</h1>

        {showReminder && !reminderClosed && (
          <div className="recheck-reminder">
            <p className="reminder-text">
              ⚠️ Anda belum melakukan <strong>recheck</strong> hari ini. Segera lakukan untuk menjaga integritas data <strong>kas</strong> & <strong>portofolio</strong>.
            </p>
            <button
              onClick={() => {
                localStorage.setItem('reminderClosed', 'true');
                setReminderClosed(true);
              }}
              className="tutup-btn"
            >
              ✕ Tutup
            </button>
          </div>
        )}

        <section className="order-form bg-white shadow rounded p-4 mb-6 max-w-xl">
          <h2 className="text-lg font-semibold mb-3">Recheck Portofolio</h2>
          <form onSubmit={handleRecheckSubmit}>
            <input type="number" placeholder="Kas" className="input" value={recheckForm.kas} onChange={(e) => setRecheckForm({ ...recheckForm, kas: e.target.value })} />
            <input type="text" placeholder="Portofolio (e.g. BBCA:100,TLKM:50)" className="input" value={recheckForm.portofolio} onChange={(e) => setRecheckForm({ ...recheckForm, portofolio: e.target.value })} />
            <input type="password" placeholder="PIN" className="input" value={recheckForm.pin} onChange={(e) => setRecheckForm({ ...recheckForm, pin: e.target.value })} />
            <input type="date" className="input mb-4" value={recheckForm.tanggal} onChange={(e) => setRecheckForm({ ...recheckForm, tanggal: e.target.value })} />
            <button className="button bg-green-600 hover:bg-green-700 text-white">Submit Recheck</button>
          </form>
        </section>

        {loading && <p>Loading instructions...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {orders.length > 0 && (
          <section className="order-table">
            <h2 className="text-lg font-semibold mb-2">Instruksi Strategist</h2>
            <table className="table-auto w-full text-sm bg-white shadow rounded">
              <thead style={{ backgroundColor: '#457aff', color: 'white' }}>
                <tr>
                  <th className="p-2 text-left">Stock</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Lots</th>
                  <th className="p-2 text-left">Strategist</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Executed At</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="p-2">{o.stock || o.order?.stock || '-'}</td>
                    <td className="p-2">{o.price || o.order?.price || '-'}</td>
                    <td className="p-2">{o.lots}</td>
                    <td className="p-2">{o.order?.strategist?.name || 'Unknown'}</td>
                    <td className="p-2">
                      <span className={`status-badge status ${o.status}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-2">{o.execution_time ?? '-'}</td>
                    <td className="p-2">
                      {o.status === 'WAITING' && (
                        <button onClick={() => executeOrder(o.id)} className="execute-btn">
                          ⚡ Execute
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default NomineePanel;