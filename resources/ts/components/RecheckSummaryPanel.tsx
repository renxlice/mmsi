import React, { useEffect, useState } from 'react';
import api from '../services/api';

type Summary = {
  totalKas: number;
  totalPortofolio: number;
  verifiedCount: number;
  unverifiedCount: number;
};

const RecheckSummaryPanel: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recheck-summary');
      setSummary(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch recheck summary:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recheck-summary-box">
      <div className="recheck-header">
        <span className="recheck-dot" />
        <h2>Ringkasan Recheck</h2>
      </div>

      {loading ? (
        <p className="text-gray-300">Memuat data...</p>
      ) : summary ? (
        <div className="recheck-cards">
          <div className="recheck-card">
            <p className="label">Total Kas</p>
            <p className="value">Rp {summary.totalKas.toLocaleString()}</p>
          </div>

          <div className="recheck-card">
            <p className="label">Total Portofolio</p>
            <p className="value">{summary.totalPortofolio.toLocaleString()} Unit</p>
          </div>

          <div className="recheck-card">
            <p className="label">Terverifikasi</p>
            <p className="value">{summary.verifiedCount}</p>
          </div>

          <div className="recheck-card">
            <p className="label">Belum Verifikasi</p>
            <p className="value">{summary.unverifiedCount}</p>
          </div>
        </div>
      ) : (
        <p className="text-red-300">Gagal memuat data ringkasan.</p>
      )}
    </div>
  );
};

export default RecheckSummaryPanel;
