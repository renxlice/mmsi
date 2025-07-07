import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '@/assets/monitoringInstruksi.css';

type Recheck = {
  id: string;
  tanggal: string;
  kas: string;
  portofolio: Record<string, string>;
  admin_name?: string;
  nominee?: { name: string };
  verifikasi_admin_1?: boolean;
};

type User = {
  name: string;
  role: string;
};

const BreakdownAuditView: React.FC = () => {
  const [rechecks, setRechecks] = useState<Recheck[]>([]);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      Accept: 'application/json',
    },
  });

  const fetchRechecks = async () => {
    try {
      const res = await axios.get('/api/recheck', authHeader());
      const parsed = res.data.map((r: any) => ({
        ...r,
        portofolio: typeof r.portofolio === 'string' ? JSON.parse(r.portofolio) : r.portofolio,
      }));
      setRechecks(parsed);
    } catch (err) {
      console.error('❌ Failed to load breakdowns:', err);
      navigate('/login');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/user', authHeader());
      const userData = res.data?.user ?? res.data;
      setCurrentUser(userData);
    } catch (err) {
      console.error('❌ Failed to fetch user:', err);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchRechecks();
  }, [navigate]);

  const handleVerify = async (id: string) => {
    await axios.post(`/api/recheck/${id}/verify`, {}, authHeader());
    fetchRechecks();
    Swal.fire('✅ Verifikasi Berhasil', 'Recheck berhasil diverifikasi', 'success');
  };

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data yang dihapus tidak dapat dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    });

    if (confirm.isConfirmed) {
      await axios.delete(`/api/recheck/${id}`, authHeader());
      fetchRechecks();
      Swal.fire('Dihapus!', 'Data berhasil dihapus.', 'success');
    }
  };

  const totalPortoValue = (portofolio: Record<string, string>) =>
    Object.values(portofolio).reduce((sum, val) => sum + parseFloat(val), 0);

  const filtered = rechecks.filter((r) =>
    (r.admin_name ?? r.nominee?.name ?? '-').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="c_admin-panel-frame">
      <aside>
        <div>
          <div className="sidebar-title">MMSI</div>
          <nav>
            <a href="/admin/dashboard">Home</a>
            <a href="/admin/monitoring-instruksi-nominee-view">Monitoring Instruksi Nominee</a>
            <a href="/admin/breakdown-audit-view" className="active">Breakdown & Audit</a>
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
            <button className="logout" onClick={() => navigate('/logout')}>Log Out</button>
          </div>
        </div>
      </aside>

      <main>
        <h1>Breakdown & Audit</h1>

        <div className="breakdown-table card overflow-x-auto">
          <section className="section-header flex justify-between items-center flex-wrap gap-4 mb-4">
            <h2 className="section-title">Daftar Breakdown & Audit</h2>
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Cari nama admin / nominee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>
          <table className="table-auto w-full text-sm">
            <thead className="bg-[#1e3a8a] text-white">
              <tr>
                <th className="p-2 text-left">Tanggal</th>
                <th className="p-2 text-left">Kas</th>
                <th className="p-2 text-left">Total Portofolio</th>
                <th className="p-2 text-left">Dibuat Oleh</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-100">
                  <td className="p-2">{r.tanggal}</td>
                  <td>{parseFloat(r.kas).toLocaleString()}</td>
                  <td>{totalPortoValue(r.portofolio).toLocaleString()}</td>
                  <td>{r.admin_name ?? r.nominee?.name ?? '-'}</td>
                  <td>
                    {r.verifikasi_admin_1 ? (
                      <span className="status-verified">✔ Terverifikasi</span>
                    ) : (
                      <span className="status-pending">⏳ Belum Diverifikasi</span>
                    )}
                  </td>
                  <td className="p-2">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {!r.verifikasi_admin_1 && (
                        <button onClick={() => handleVerify(r.id)} className="btn-verify">
                          ✅ Verifikasi
                        </button>
                      )}
                      <button onClick={() => handleDelete(r.id)} className="btn-delete">
                        🗑 Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default BreakdownAuditView;
