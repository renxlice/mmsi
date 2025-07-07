import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import '@/assets/c_admin-panel.css';

Chart.register(...registerables);

const AdminPanel: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', pin: '', role: 'STRATEGIST' });
  const [users, setUsers] = useState<any[]>([]);
  const [recheckForm, setRecheckForm] = useState({ tanggal: '', kas: '', portofolio: '', pin: '' });
  const [recheckList, setRecheckList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderClosed, setReminderClosed] = useState(() => localStorage.getItem('adminReminderClosed') === 'true');

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      Accept: 'application/json',
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchRechecks();
    fetchCurrentUser();
    checkRecheckToday();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastDismissed = localStorage.getItem('adminReminderDismissedDate');
    if (lastDismissed !== today) {
      localStorage.removeItem('adminReminderClosed');
      localStorage.setItem('adminReminderDismissedDate', today);
    }
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get('/api/admin/users', authHeader());
    setUsers(res.data.users);
  };

  const fetchRechecks = async () => {
    const res = await axios.get('/api/recheck', authHeader());
    const parsed = res.data.map((r: any) => ({
      ...r,
      portofolio: typeof r.portofolio === 'string' ? JSON.parse(r.portofolio) : r.portofolio,
    }));
    setRecheckList(parsed);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/user', authHeader());
      setCurrentUser(res.data.user);
    } catch (error) {
      console.error('Gagal mengambil data user saat ini', error);
    }
  };

  const checkRecheckToday = async () => {
    try {
      const res = await axios.get('/api/system/auto-recheck', authHeader());
      const msg = res.data.message?.toLowerCase() || '';
      if (msg.includes('belum ada recheck') || msg.includes('recheck belum dilakukan')) {
        setShowReminder(true);
      }
    } catch (err) {
      console.warn('[Admin Reminder Error]', err);
    }
  };

    const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/admin/register-user', form, authHeader());
      Swal.fire('Sukses', 'User berhasil ditambahkan', 'success');
      setForm({ name: '', email: '', password: '', pin: '', role: 'STRATEGIST' });
      fetchUsers();
      setMessage(null);
    } catch {
      setMessage(null);
      Swal.fire('Gagal', 'Gagal menambahkan user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPorto: Record<string, string> = {};
    recheckForm.portofolio.split(',').forEach(entry => {
      const [stock, value] = entry.split(':').map(s => s.trim());
      if (stock && value) parsedPorto[stock] = value;
    });

    await axios.post('/api/recheck', {
      tanggal: recheckForm.tanggal,
      kas: recheckForm.kas,
      portofolio: parsedPorto,
      pin: recheckForm.pin,
    }, authHeader());

    fetchRechecks();
    setRecheckForm({ tanggal: '', kas: '', portofolio: '', pin: '' });
    Swal.fire('Sukses', 'Recheck berhasil disimpan', 'success');
    localStorage.removeItem('adminReminderClosed');
    setReminderClosed(false);
    setShowReminder(false);
  };

  const handleExportExcel = async () => {
  try {
    const response = await axios.get('/api/recheck-export', {
      ...authHeader(),
      responseType: 'blob', // ✅ Penting agar bisa handle file
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'recheck_export.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    Swal.fire('Gagal', 'Gagal mengekspor data', 'error');
  }
};


  const totalPortoValue = (portofolio: Record<string, string>) =>
    Object.values(portofolio).reduce((sum, val) => sum + parseFloat(val), 0);

  const toggleAktif = async (userId: number) => {
    try {
      await axios.post(`/api/admin/toggle-user/${userId}`, {}, authHeader());
      fetchUsers();
    } catch {
      Swal.fire('Gagal', 'Gagal memperbarui status user', 'error');
    }
  };

  return (
    <div className="c_strategist-panel-ho-frame">
      <aside>
        <div>
          <div className="sidebar-title">MMSI</div>
          <nav>
            <a href="/admin/dashboard" className="active">Home</a>
            <a href="/admin/monitoring-instruksi-nominee-view">Monitoring Instruksi Nominee</a>
            <a href="/admin/breakdown-audit-view">Breakdown & Audit</a>
            <a href="/admin/admin-activity-log-panel">Activity Log</a>
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
        <h1>Admin Panel</h1>

        {showReminder && !reminderClosed && (
          <div className="recheck-reminder">
            <div className="reminder-text">
              ⚠️ <span className="reminder-message">
                Anda <strong>belum melakukan recheck</strong> hari ini. Mohon segera isi data <strong>kas</strong> dan <strong>portofolio</strong>.
              </span>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('adminReminderClosed', 'true');
                setReminderClosed(true);
              }}
              className="tutup-btn"
            >
              ✕ Tutup
            </button>
          </div>
        )}

        {message && <p className="text-green-600 mb-4">{message}</p>}

        {/* REGISTER USER */}
        <section className="order-form">
          <form onSubmit={handleRegister} className="space-y-3">
            <h2 className="text-lg font-semibold mb-3">Register New User</h2>
            <input type="text" placeholder="Name" required className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input type="email" placeholder="Email" required className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password" required className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <input type="password" placeholder="PIN" required className="input" value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} />
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="STRATEGIST">Strategist</option>
              <option value="NOMINEE">Nominee</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button type="submit" disabled={loading} className="button">{loading ? 'Registering...' : 'Register'}</button>
          </form>
        </section>

        {/* USER LIST + EXPORT */}
        <section className="user-table mt-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">User List</h2>
          </div>
          <table className="table-auto w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">
                    <span className={user.aktif ? 'text-green-600' : 'text-red-500'}>
                      {user.aktif ? 'Active' : 'Non-Active'}
                    </span>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => toggleAktif(user.id)}
                      className={user.aktif ? 'button-deactivate' : 'button-activate'}
                    >
                      {user.aktif ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* FORM RECHECK */}
        <section className="order-form bg-white shadow rounded p-4 mt-8 max-w-xl">
          <form onSubmit={handleRecheckSubmit} className="space-y-3">
            <h2 className="text-lg font-semibold mb-3">Recheck Kas & Portofolio</h2>
            <input type="number" placeholder="Kas" required className="input" value={recheckForm.kas} onChange={e => setRecheckForm({ ...recheckForm, kas: e.target.value })} />
            <input type="text" placeholder="Portofolio (e.g. BBCA:100,TLKM:50)" required className="input" value={recheckForm.portofolio} onChange={e => setRecheckForm({ ...recheckForm, portofolio: e.target.value })} />
            <input type="date" required className="input" value={recheckForm.tanggal} onChange={e => setRecheckForm({ ...recheckForm, tanggal: e.target.value })} />
            <input type="password" placeholder="PIN" required className="input" value={recheckForm.pin} onChange={e => setRecheckForm({ ...recheckForm, pin: e.target.value })} />
            <button type="submit" className="button">Simpan</button>
          </form>
        </section>

        {/* CHART */}
        <section className="chart-container mt-10">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Grafik Recheck</h2>
          <button className="button-export" onClick={handleExportExcel}>
          📥 Export Recheck (Excel)
          </button>
          <Line
            data={{
              labels: recheckList.map(r => r.tanggal),
              datasets: [
                {
                  label: 'Kas',
                  data: recheckList.map(r => parseFloat(r.kas)),
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: 'Portofolio',
                  data: recheckList.map(r => totalPortoValue(r.portofolio)),
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  tension: 0.4,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: '#1e293b',
                    font: { size: 12, weight: 'bold' },
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
                x: { ticks: { color: '#475569' }, grid: { color: '#f1f5f9' } },
                y: { ticks: { color: '#475569' }, grid: { color: '#f1f5f9' } },
              },
            }}
            height={300}
          />
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;
