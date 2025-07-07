import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '@/assets/monitoringInstruksi.css';

type Instruction = {
  id: string;
  stock: string;
  price: number;
  lots: number;
  status: string;
  execution_time: string | null;
  order: { strategist: { name: string } | null };
  nominee: { name: string } | null;
};

type User = {
  name: string;
  role: string;
};

const MonitoringInstruksiNomineeView: React.FC = () => {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [filteredInstructions, setFilteredInstructions] = useState<Instruction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      Accept: 'application/json',
    },
  });

  const fetchInstructions = async () => {
    try {
      const res = await axios.get('/api/admin/nominee-instructions', authHeader());
      const data = res.data?.data || [];
      setInstructions(data);
      setFilteredInstructions(data);
    } catch (err) {
      console.error('❌ Gagal memuat instruksi:', err);
      navigate('/login');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/user', authHeader());
      const userData = res.data?.user || res.data;
      setCurrentUser(userData);
    } catch (err) {
      console.error('❌ Gagal memuat data user:', err);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchInstructions();
  }, [navigate]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = instructions.filter(i =>
      i.stock.toLowerCase().includes(term) ||
      i.order?.strategist?.name?.toLowerCase().includes(term) ||
      i.nominee?.name?.toLowerCase().includes(term)
    );
    setFilteredInstructions(filtered);
  };

  return (
    <div className="c_admin-panel-frame">
      <aside>
        <div>
          <div className="sidebar-title">MMSI</div>
          <nav>
            <a href="/admin/dashboard">Home</a>
            <a href="/admin/monitoring-instruksi-nominee-view" className="active">Monitoring Instruksi Nominee</a>
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
            <button className="logout" onClick={() => navigate('/logout')}>Log Out</button>
          </div>
        </div>
      </aside>

      <main>
        <h1>Monitoring Instruksi Nominee</h1>

        <section className="nominee-table card overflow-x-auto">
          <div className="section-header flex justify-between items-center flex-wrap gap-4 mb-4">
            <h2 className="text-lg font-semibold">Daftar Instruksi</h2>
            <input
              type="text"
              placeholder="🔍 Cari stock, strategist, atau nominee..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <table className="table-auto w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Stock</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Lots</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Strategist</th>
                <th className="p-2 text-left">Nominee</th>
                <th className="p-2 text-left">Executed At</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructions.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="p-2 stock">{i.stock}</td>
                  <td className="p-2 highlight-number">{i.price}</td>
                  <td className="p-2 highlight-number">{i.lots}</td>
                  <td className="p-2">
                    <span className={`status-badge ${i.status.toUpperCase()}`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="p-2 strategist">{i.order?.strategist?.name ?? '-'}</td>
                  <td className="p-2 nominee">{i.nominee?.name ?? '-'}</td>
                  <td className="p-2 executed-at">{i.execution_time ?? '-'}</td>
                </tr>
              ))}
              {filteredInstructions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Tidak ada instruksi yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default MonitoringInstruksiNomineeView;
